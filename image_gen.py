import os
import uuid
import torch
from PIL import Image
from config import IMAGE_MODEL_ID, LORA_WEIGHTS_PATH, HF_TOKEN, IMAGE_OUTPUT_DIR

# Global pipeline — loaded once, reused across calls
_pipe = None


def _load_pipeline():
    """Load SDXL + LoRA weights. Cached after first call."""
    global _pipe
    if _pipe is not None:
        return _pipe

    from diffusers import StableDiffusionXLPipeline
    from peft import PeftModel

    print("Loading SDXL pipeline (first time takes a few minutes)...")

    # Use MPS on Apple Silicon, CUDA on GPU, CPU as fallback
    if torch.backends.mps.is_available():
        device = "mps"
        dtype = torch.float16
    elif torch.cuda.is_available():
        device = "cuda"
        dtype = torch.float16
    else:
        device = "cpu"
        dtype = torch.float32

    pipe = StableDiffusionXLPipeline.from_pretrained(
        IMAGE_MODEL_ID,
        torch_dtype=dtype,
        variant="fp16",
        low_cpu_mem_usage=True,
        token=HF_TOKEN or None,
    ).to(device)

    # Load fine-tuned LoRA weights if available
    if os.path.isdir(LORA_WEIGHTS_PATH):
        print(f"Loading LoRA weights from {LORA_WEIGHTS_PATH}...")
        pipe.unet = PeftModel.from_pretrained(pipe.unet, LORA_WEIGHTS_PATH)
        print("LoRA weights loaded.")
    else:
        print(f"No LoRA weights found at {LORA_WEIGHTS_PATH}, using base model.")

    _pipe = pipe
    print(f"Pipeline ready on {device}.")
    return _pipe


def generate_image(prompt, negative_prompt="blurry, low quality, distorted", save=True):
    """Generate an image using SDXL + LoRA locally.

    Returns the PIL image and the saved file path (if save=True).
    """
    pipe = _load_pipeline()

    image = pipe(
        prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=30,
    ).images[0]

    file_path = None
    if save:
        filename = f"{uuid.uuid4().hex[:8]}.png"
        file_path = os.path.join(IMAGE_OUTPUT_DIR, filename)
        image.save(file_path)

    return image, file_path


if __name__ == "__main__":
    prompt = "university student confidently presenting their unique skills to employers, software engineering, warm lighting, professional photography"
    try:
        img, path = generate_image(prompt)
        print(f"Image saved to: {path}")
    except Exception as e:
        print(f"Error: {e}")
