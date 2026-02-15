import os
import uuid
import requests
from config import VIDEO_MODEL_ID, HF_TOKEN, VIDEO_OUTPUT_DIR


HF_INFERENCE_URL = f"https://api-inference.huggingface.co/models/{VIDEO_MODEL_ID}"


def generate_video_api(prompt, output_format="mp4"):
    """Generate a video using Hugging Face Inference API.

    This is the primary method for M2 Macs since video models
    are too large to run locally.

    Returns the saved file path.
    """
    if not HF_TOKEN:
        raise ValueError(
            "HF_TOKEN environment variable is required for video generation. "
            "Set it with: export HF_TOKEN=your_token_here"
        )

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": prompt}

    response = requests.post(HF_INFERENCE_URL, headers=headers, json=payload)
    response.raise_for_status()

    filename = f"{uuid.uuid4().hex[:8]}.{output_format}"
    file_path = os.path.join(VIDEO_OUTPUT_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(response.content)

    return file_path


def generate_video_local(prompt, num_inference_steps=None, num_frames=None):
    """Generate a video locally using diffusers (requires significant RAM).

    Fallback for systems with enough memory. Not recommended for M2.
    """
    from diffusers import DiffusionPipeline
    from config import DEVICE, TORCH_DTYPE, VIDEO_DEFAULTS
    import torch
    from PIL import Image

    steps = num_inference_steps or VIDEO_DEFAULTS["num_inference_steps"]
    frames = num_frames or VIDEO_DEFAULTS["num_frames"]

    pipe = DiffusionPipeline.from_pretrained(
        VIDEO_MODEL_ID,
        torch_dtype=TORCH_DTYPE,
        token=HF_TOKEN or None,
    )
    pipe.to(DEVICE)

    result = pipe(
        prompt=prompt,
        num_inference_steps=steps,
        num_frames=frames,
    )
    video_frames = result.frames[0]

    filename = f"{uuid.uuid4().hex[:8]}.gif"
    file_path = os.path.join(VIDEO_OUTPUT_DIR, filename)

    pil_frames = []
    for frame in video_frames:
        if not isinstance(frame, Image.Image):
            frame = Image.fromarray(frame)
        pil_frames.append(frame)

    pil_frames[0].save(
        file_path,
        save_all=True,
        append_images=pil_frames[1:],
        duration=100,
        loop=0,
    )
    return file_path


def generate_video(prompt, use_api=True, **kwargs):
    """Generate a video from a text prompt.

    Uses the HF Inference API by default (recommended for M2).
    Set use_api=False to run locally (requires more memory).
    """
    if use_api:
        return generate_video_api(prompt, **kwargs)
    return generate_video_local(prompt, **kwargs)


if __name__ == "__main__":
    prompt = "a university student confidently presenting their career plan, professional setting, educational"
    try:
        path = generate_video(prompt, use_api=True)
        print(f"Video saved to: {path}")
    except ValueError as e:
        print(f"Error: {e}")
        print("Set HF_TOKEN to use the API, or use generate_video_local() for local generation.")
