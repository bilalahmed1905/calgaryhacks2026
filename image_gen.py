import os
import uuid
from diffusers import StableDiffusionPipeline
from config import (
    IMAGE_MODEL_ID, DEVICE, TORCH_DTYPE, HF_TOKEN,
    IMAGE_DEFAULTS, IMAGE_OUTPUT_DIR,
)


_pipeline = None


def get_pipeline():
    """Load the Stable Diffusion pipeline (cached after first call)."""
    global _pipeline
    if _pipeline is None:
        _pipeline = StableDiffusionPipeline.from_pretrained(
            IMAGE_MODEL_ID,
            torch_dtype=TORCH_DTYPE,
            token=HF_TOKEN or None,
            safety_checker=None,
        )
        _pipeline.to(DEVICE)
        if DEVICE.type == "mps":
            _pipeline.enable_attention_slicing()
    return _pipeline


def load_lora_weights(lora_path):
    """Load LoRA weights into the pipeline."""
    pipe = get_pipeline()
    pipe.load_lora_weights(lora_path)
    return pipe


def generate_image(
    prompt,
    negative_prompt="blurry, low quality, distorted, ugly",
    num_inference_steps=None,
    guidance_scale=None,
    width=None,
    height=None,
    save=True,
):
    """Generate an image from a text prompt.

    Returns the PIL image and the saved file path (if save=True).
    """
    pipe = get_pipeline()

    steps = num_inference_steps or IMAGE_DEFAULTS["num_inference_steps"]
    scale = guidance_scale or IMAGE_DEFAULTS["guidance_scale"]
    w = width or IMAGE_DEFAULTS["width"]
    h = height or IMAGE_DEFAULTS["height"]

    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=steps,
        guidance_scale=scale,
        width=w,
        height=h,
    )
    image = result.images[0]

    file_path = None
    if save:
        filename = f"{uuid.uuid4().hex[:8]}.png"
        file_path = os.path.join(IMAGE_OUTPUT_DIR, filename)
        image.save(file_path)

    return image, file_path


if __name__ == "__main__":
    print(f"Using device: {DEVICE}")
    prompt = "professional illustration of a university student planning their career path, modern flat design, educational"
    img, path = generate_image(prompt)
    print(f"Image saved to: {path}")
