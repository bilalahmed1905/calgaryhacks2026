"""
Claire — Local Image Generation with Fine-Tuned SD 1.5 LoRA
Uses bilalahmed927/Claire LoRA weights from HuggingFace.
First run downloads the model (~4GB base + ~23MB LoRA), then caches locally.

Usage:
  python image_gen.py "a futuristic university classroom"
  python image_gen.py  (uses default prompt)

As a module:
  from image_gen import generate_image
  path = generate_image("educational infographic about AI ethics")
"""

import os
import sys
import hashlib
import torch
from diffusers import StableDiffusionPipeline
from peft import PeftModel

# ── Config ──────────────────────────────────────────────────────
BASE_MODEL_ID = "runwayml/stable-diffusion-v1-5"
LORA_REPO_ID = "bilalahmed927/Claire"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "generated")
HF_TOKEN = os.environ.get("HF_TOKEN", "")

# ── Cached pipeline ────────────────────────────────────────────
_pipeline = None


def _get_pipeline():
    """Load SD 1.5 + Claire LoRA once, reuse for all requests."""
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    print(f"📦 Loading base model: {BASE_MODEL_ID}")
    print(f"   (First run downloads ~4GB — subsequent runs use cache)")

    # Use float32 for CPU (Intel Mac), float16 for CUDA
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    device = "cuda" if torch.cuda.is_available() else "cpu"

    pipe = StableDiffusionPipeline.from_pretrained(
        BASE_MODEL_ID,
        torch_dtype=dtype,
        safety_checker=None,
        requires_safety_checker=False,
        token=HF_TOKEN if HF_TOKEN else None,
    )

    print(f"🎨 Loading Claire LoRA from {LORA_REPO_ID}...")
    pipe.load_lora_weights(LORA_REPO_ID, token=HF_TOKEN if HF_TOKEN else None)

    pipe = pipe.to(device)

    # Optimizations for CPU
    if device == "cpu":
        pipe.enable_attention_slicing()

    print(f"✅ Pipeline ready on {device} ({dtype})")
    _pipeline = pipe
    return _pipeline


def generate_image(prompt: str, num_steps: int = 25, guidance: float = 7.5) -> str:
    """
    Generate an image and save it to public/generated/.
    Returns the filename (not full path).
    """
    pipe = _get_pipeline()
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Style suffix for educational visuals
    style = "clean modern design, professional, university educational material, high quality, detailed"
    full_prompt = f"{prompt}, {style}"

    print(f"🎨 Generating: {full_prompt[:80]}...")

    with torch.no_grad():
        result = pipe(
            prompt=full_prompt,
            num_inference_steps=num_steps,
            guidance_scale=guidance,
            height=512,
            width=512,
        )

    image = result.images[0]
    filename = hashlib.md5(full_prompt.encode()).hexdigest()[:12] + ".png"
    filepath = os.path.join(OUTPUT_DIR, filename)
    image.save(filepath)
    print(f"✅ Saved: {filepath}")

    return filename


# ── CLI entry point ─────────────────────────────────────────────
if __name__ == "__main__":
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "a futuristic university classroom with AI learning tools"
    filename = generate_image(prompt)
    print(f"\n🖼️  Output: {os.path.join(OUTPUT_DIR, filename)}")
