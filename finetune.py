"""
LoRA Fine-Tuning Script for Stable Diffusion XL.

NOTE: This script is designed to run on a machine with a GPU
(e.g. Google Colab with a free T4). It will NOT run on an M2 Mac
in a reasonable time.

Usage (on Colab or GPU machine):
    pip install diffusers transformers torch accelerate peft safetensors
    python finetune.py ./training_images "educational career illustration"
"""

import os
import sys


def finetune_lora(
    image_folder,
    prompt,
    output_name="ascend_ignite_lora",
    num_epochs=5,
    learning_rate=1e-4,
    lora_rank=4,
    batch_size=1,
):
    import torch
    from diffusers import StableDiffusionXLPipeline, DDPMScheduler
    from peft import LoraConfig, get_peft_model
    from torch.utils.data import Dataset, DataLoader
    from torchvision import transforms
    from PIL import Image

    IMAGE_MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
    HF_TOKEN = os.environ.get("HF_TOKEN", "")
    LORA_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs", "lora_weights")
    os.makedirs(LORA_OUTPUT_DIR, exist_ok=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32

    class ImagePromptDataset(Dataset):
        def __init__(self, folder, prompt, size=512):
            valid_ext = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
            self.images = []
            for f in sorted(os.listdir(folder)):
                if os.path.splitext(f)[1].lower() in valid_ext:
                    img = Image.open(os.path.join(folder, f)).convert("RGB").resize((size, size))
                    self.images.append(img)
            self.prompt = prompt
            self.transform = transforms.Compose([
                transforms.ToTensor(),
                transforms.Normalize([0.5], [0.5]),
            ])

        def __len__(self):
            return len(self.images)

        def __getitem__(self, idx):
            return {"pixel_values": self.transform(self.images[idx]), "prompt": self.prompt}

    print(f"Using device: {device}")

    pipe = StableDiffusionXLPipeline.from_pretrained(
        IMAGE_MODEL_ID, torch_dtype=dtype, token=HF_TOKEN or None,
    )

    lora_config = LoraConfig(
        r=lora_rank,
        lora_alpha=lora_rank * 2,
        target_modules=["to_k", "to_q", "to_v", "to_out.0"],
        lora_dropout=0.05,
    )

    unet = get_peft_model(pipe.unet, lora_config)
    unet.to(device)
    unet.train()

    trainable = sum(p.numel() for p in unet.parameters() if p.requires_grad)
    total = sum(p.numel() for p in unet.parameters())
    print(f"Trainable: {trainable:,} / {total:,} ({100 * trainable / total:.2f}%)")

    dataset = ImagePromptDataset(image_folder, prompt)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    optimizer = torch.optim.AdamW(
        filter(lambda p: p.requires_grad, unet.parameters()), lr=learning_rate,
    )
    noise_scheduler = DDPMScheduler.from_pretrained(IMAGE_MODEL_ID, subfolder="scheduler")

    print(f"Training on {len(dataset)} images for {num_epochs} epochs...")
    for epoch in range(num_epochs):
        epoch_loss = 0.0
        for batch in dataloader:
            pixel_values = batch["pixel_values"].to(device)
            noise = torch.randn_like(pixel_values)
            timesteps = torch.randint(
                0, noise_scheduler.config.num_train_timesteps,
                (pixel_values.shape[0],), device=device,
            ).long()
            noisy = noise_scheduler.add_noise(pixel_values, noise, timesteps)
            pred = unet(noisy, timesteps).sample
            loss = torch.nn.functional.mse_loss(pred, noise)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        print(f"Epoch {epoch + 1}/{num_epochs} - Loss: {epoch_loss / len(dataloader):.4f}")

    save_path = os.path.join(LORA_OUTPUT_DIR, output_name)
    unet.save_pretrained(save_path)
    print(f"LoRA weights saved to: {save_path}")
    return save_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python finetune.py <image_folder> <prompt>")
        print('Example: python finetune.py ./training_images "educational career illustration"')
        sys.exit(1)
    finetune_lora(sys.argv[1], sys.argv[2])
