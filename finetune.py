import os
import torch
from diffusers import StableDiffusionXLPipeline, DDPMScheduler
from peft import LoraConfig, get_peft_model
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from config import (
    IMAGE_MODEL_ID, DEVICE, TORCH_DTYPE, HF_TOKEN, LORA_OUTPUT_DIR,
)
from utils import load_images_from_folder


class ImagePromptDataset(Dataset):
    """Simple dataset of (image, prompt) pairs for LoRA fine-tuning."""

    def __init__(self, image_folder, prompt, size=1024):
        self.images = load_images_from_folder(image_folder, size=(size, size))
        self.prompt = prompt
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),
        ])

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        image = self.transform(self.images[idx])
        return {"pixel_values": image, "prompt": self.prompt}


def finetune_lora(
    image_folder,
    prompt,
    output_name="ascend_ignite_lora",
    num_epochs=5,
    learning_rate=1e-4,
    lora_rank=4,
    batch_size=1,
):
    """Fine-tune Stable Diffusion with LoRA on a folder of images.

    Args:
        image_folder: Path to folder containing training images.
        prompt: Text prompt describing the training images.
        output_name: Name for saved LoRA weights.
        num_epochs: Number of training epochs.
        learning_rate: Learning rate for LoRA training.
        lora_rank: Rank for LoRA decomposition (lower = lighter).
        batch_size: Training batch size (keep at 1 for M2).

    Returns:
        Path to saved LoRA weights.
    """
    pipe = StableDiffusionXLPipeline.from_pretrained(
        IMAGE_MODEL_ID,
        torch_dtype=TORCH_DTYPE,
        token=HF_TOKEN or None,
    )

    lora_config = LoraConfig(
        r=lora_rank,
        lora_alpha=lora_rank * 2,
        target_modules=["to_k", "to_q", "to_v", "to_out.0"],
        lora_dropout=0.05,
    )

    unet = pipe.unet
    unet = get_peft_model(unet, lora_config)
    unet.to(DEVICE)
    unet.train()

    trainable = sum(p.numel() for p in unet.parameters() if p.requires_grad)
    total = sum(p.numel() for p in unet.parameters())
    print(f"Trainable parameters: {trainable:,} / {total:,} ({100 * trainable / total:.2f}%)")

    dataset = ImagePromptDataset(image_folder, prompt)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    optimizer = torch.optim.AdamW(
        filter(lambda p: p.requires_grad, unet.parameters()),
        lr=learning_rate,
    )

    noise_scheduler = DDPMScheduler.from_pretrained(
        IMAGE_MODEL_ID, subfolder="scheduler"
    )

    print(f"Training on {len(dataset)} images for {num_epochs} epochs...")

    for epoch in range(num_epochs):
        epoch_loss = 0.0
        for batch in dataloader:
            pixel_values = batch["pixel_values"].to(DEVICE)

            noise = torch.randn_like(pixel_values)
            timesteps = torch.randint(
                0, noise_scheduler.config.num_train_timesteps,
                (pixel_values.shape[0],), device=DEVICE,
            ).long()

            noisy_images = noise_scheduler.add_noise(pixel_values, noise, timesteps)

            noise_pred = unet(noisy_images, timesteps).sample
            loss = torch.nn.functional.mse_loss(noise_pred, noise)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()

        avg_loss = epoch_loss / len(dataloader)
        print(f"Epoch {epoch + 1}/{num_epochs} - Loss: {avg_loss:.4f}")

    save_path = os.path.join(LORA_OUTPUT_DIR, output_name)
    unet.save_pretrained(save_path)
    print(f"LoRA weights saved to: {save_path}")

    return save_path


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python finetune.py <image_folder> <prompt>")
        print('Example: python finetune.py ./training_images "educational career illustration"')
        sys.exit(1)

    folder = sys.argv[1]
    prompt_text = sys.argv[2]
    finetune_lora(folder, prompt_text)
