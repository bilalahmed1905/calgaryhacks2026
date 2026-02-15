"""
LoRA Fine-Tuning Script for Stable Diffusion XL.

NOTE: This script is designed to run on a machine with a GPU
(e.g. Google Colab with a free T4). It will NOT run on an M2 Mac
in a reasonable time.

Usage (on Colab or GPU machine):
    pip install diffusers transformers torch accelerate peft safetensors
    python finetune.py ./training_images "educational career illustration"
"""

import gc
import os
import sys


def finetune_lora(
    image_folder,
    prompt,
    output_name="claritypath_lora",
    num_epochs=5,
    learning_rate=1e-5,
    lora_rank=4,
    batch_size=1,
):
    import torch
    from diffusers import StableDiffusionXLPipeline, DDPMScheduler
    from peft import LoraConfig, get_peft_model
    from torchvision import transforms
    from PIL import Image

    IMAGE_MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
    HF_TOKEN = os.environ.get("HF_TOKEN", "")
    LORA_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs", "lora_weights")
    os.makedirs(LORA_OUTPUT_DIR, exist_ok=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"

    # ------------------------------------------------------------------
    # 1. Load pipeline in float16 to save memory
    # ------------------------------------------------------------------
    print(f"Using device: {device}")
    print("Loading pipeline in float16...")
    pipe = StableDiffusionXLPipeline.from_pretrained(
        IMAGE_MODEL_ID,
        torch_dtype=torch.float16,
        variant="fp16",
        low_cpu_mem_usage=True,
        token=HF_TOKEN or None,
    )

    # ------------------------------------------------------------------
    # 2. Encode the prompt on GPU, then delete text encoders entirely
    # ------------------------------------------------------------------
    print("Encoding prompt...")
    tokenizer_output = pipe.tokenizer(
        prompt, padding="max_length", max_length=pipe.tokenizer.model_max_length,
        truncation=True, return_tensors="pt",
    )
    tokenizer_2_output = pipe.tokenizer_2(
        prompt, padding="max_length", max_length=pipe.tokenizer_2.model_max_length,
        truncation=True, return_tensors="pt",
    )

    pipe.text_encoder.to(device)
    pipe.text_encoder_2.to(device)

    with torch.no_grad():
        te1_out = pipe.text_encoder(
            tokenizer_output.input_ids.to(device), output_hidden_states=True,
        )
        te2_out = pipe.text_encoder_2(
            tokenizer_2_output.input_ids.to(device), output_hidden_states=True,
        )
        encoder_hidden_states = torch.cat([
            te1_out.hidden_states[-2],
            te2_out.hidden_states[-2],
        ], dim=-1).float().detach()
        pooled_output = te2_out[0].float().detach()

    del te1_out, te2_out, tokenizer_output, tokenizer_2_output
    del pipe.text_encoder, pipe.text_encoder_2
    gc.collect()
    torch.cuda.empty_cache()
    print("Text encoders freed.")

    # ------------------------------------------------------------------
    # 3. Pre-encode ALL images through VAE in FLOAT32, then delete VAE
    #    SDXL VAE is known to produce NaN in float16. The official
    #    diffusers scripts explicitly keep VAE in float32.
    # ------------------------------------------------------------------
    print("Pre-encoding images through VAE (float32)...")
    valid_ext = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5]),
    ])

    all_latents = []
    pipe.vae.to(device, dtype=torch.float32)
    pipe.vae.requires_grad_(False)

    for f in sorted(os.listdir(image_folder)):
        if os.path.splitext(f)[1].lower() in valid_ext:
            img = Image.open(os.path.join(image_folder, f)).convert("RGB").resize((512, 512))
            pixel = transform(img).unsqueeze(0).to(device, dtype=torch.float32)
            with torch.no_grad():
                latent = pipe.vae.encode(pixel).latent_dist.sample()
                latent = (latent * pipe.vae.config.scaling_factor).cpu()
            if torch.isnan(latent).any():
                print(f"  WARNING: NaN in latent for {f}, skipping")
                continue
            all_latents.append(latent)
            print(f"  Encoded {f} (latent range: {latent.min():.3f} to {latent.max():.3f})")

    print(f"Encoded {len(all_latents)} images to latents.")

    del pipe.vae
    gc.collect()
    torch.cuda.empty_cache()
    print("VAE freed.")

    # ------------------------------------------------------------------
    # 4. Set up LoRA on UNet
    #    Base model stays float16 (frozen, saves memory)
    #    LoRA params cast to float32 (trainable, stable gradients)
    # ------------------------------------------------------------------
    lora_config = LoraConfig(
        r=lora_rank,
        lora_alpha=lora_rank * 2,
        target_modules=["to_k", "to_q", "to_v", "to_out.0"],
        lora_dropout=0.05,
    )

    unet = get_peft_model(pipe.unet, lora_config)
    unet.to(device)
    unet.enable_gradient_checkpointing()

    for param in unet.parameters():
        if param.requires_grad:
            param.data = param.data.float()
    unet.train()

    trainable = sum(p.numel() for p in unet.parameters() if p.requires_grad)
    total = sum(p.numel() for p in unet.parameters())
    print(f"Trainable: {trainable:,} / {total:,} ({100 * trainable / total:.2f}%)")

    optimizer = torch.optim.AdamW(
        filter(lambda p: p.requires_grad, unet.parameters()), lr=learning_rate,
    )
    noise_scheduler = DDPMScheduler.from_pretrained(IMAGE_MODEL_ID, subfolder="scheduler")
    scaler = torch.cuda.amp.GradScaler()

    add_time_ids = torch.tensor([[512, 512, 0, 0, 512, 512]], dtype=torch.float32, device=device)
    encoder_hidden_states = encoder_hidden_states.to(device)
    pooled_output = pooled_output.to(device)

    # ------------------------------------------------------------------
    # 5. Training loop
    #    autocast handles mixed float16/float32 dtypes in forward pass
    #    GradScaler prevents gradient underflow in float16
    #    Loss computed in float32 for stability
    # ------------------------------------------------------------------
    print(f"\nTraining on {len(all_latents)} images for {num_epochs} epochs...")
    for epoch in range(num_epochs):
        epoch_loss = 0.0
        for latent in all_latents:
            latent_gpu = latent.to(device, dtype=torch.float32)

            noise = torch.randn_like(latent_gpu)
            timesteps = torch.randint(
                0, noise_scheduler.config.num_train_timesteps,
                (1,), device=device,
            ).long()
            noisy_latents = noise_scheduler.add_noise(latent_gpu, noise, timesteps)

            added_cond_kwargs = {
                "text_embeds": pooled_output,
                "time_ids": add_time_ids,
            }

            with torch.autocast("cuda", dtype=torch.float16):
                pred = unet(
                    noisy_latents, timesteps,
                    encoder_hidden_states=encoder_hidden_states,
                    added_cond_kwargs=added_cond_kwargs,
                ).sample

            loss = torch.nn.functional.mse_loss(pred.float(), noise.float())

            optimizer.zero_grad()
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(unet.parameters(), 1.0)
            scaler.step(optimizer)
            scaler.update()
            epoch_loss += loss.item()

        avg_loss = epoch_loss / len(all_latents)
        print(f"Epoch {epoch + 1}/{num_epochs} - Loss: {avg_loss:.4f}")

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
