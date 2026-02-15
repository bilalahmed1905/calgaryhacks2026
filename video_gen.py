import os
import uuid
import requests
from config import VIDEO_API_URL, HF_TOKEN, VIDEO_OUTPUT_DIR


def generate_video(prompt, output_format="mp4"):
    """Generate a video using the HF Inference API.

    Returns the saved file path.
    """
    if not HF_TOKEN:
        raise ValueError(
            "HF_TOKEN environment variable is required. "
            "Set it with: export HF_TOKEN=your_token_here"
        )

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": prompt}

    response = requests.post(VIDEO_API_URL, headers=headers, json=payload)
    response.raise_for_status()

    filename = f"{uuid.uuid4().hex[:8]}.{output_format}"
    file_path = os.path.join(VIDEO_OUTPUT_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(response.content)

    return file_path


if __name__ == "__main__":
    prompt = "a university student confidently presenting their career plan, professional setting, educational"
    try:
        path = generate_video(prompt)
        print(f"Video saved to: {path}")
    except ValueError as e:
        print(f"Error: {e}")
