import os
import uuid
import requests
from io import BytesIO
from PIL import Image
from config import IMAGE_API_URL, HF_TOKEN, IMAGE_OUTPUT_DIR


def generate_image(prompt, negative_prompt="blurry, low quality, distorted", save=True):
    """Generate an image using the HF Inference API.

    Returns the PIL image and the saved file path (if save=True).
    """
    if not HF_TOKEN:
        raise ValueError(
            "HF_TOKEN environment variable is required. "
            "Set it with: export HF_TOKEN=your_token_here"
        )

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {"negative_prompt": negative_prompt},
    }

    response = requests.post(IMAGE_API_URL, headers=headers, json=payload)
    response.raise_for_status()

    image = Image.open(BytesIO(response.content))

    file_path = None
    if save:
        filename = f"{uuid.uuid4().hex[:8]}.png"
        file_path = os.path.join(IMAGE_OUTPUT_DIR, filename)
        image.save(file_path)

    return image, file_path


if __name__ == "__main__":
    prompt = "professional illustration of a university student planning their career path, modern flat design, educational"
    try:
        img, path = generate_image(prompt)
        print(f"Image saved to: {path}")
    except ValueError as e:
        print(f"Error: {e}")
