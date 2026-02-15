import os
from PIL import Image
from config import MODULE_1_PROMPTS, MODULE_2_PROMPTS, MODULE_3_PROMPTS


def build_module1_prompt(field, template_index=0):
    """Build an image prompt for Module 1: Skills Discovery."""
    templates = MODULE_1_PROMPTS
    idx = template_index % len(templates)
    return templates[idx].format(field=field)


def build_module2_prompt(field, concept, template_index=0):
    """Build an image prompt for Module 2: VUCA & Uncertainty."""
    templates = MODULE_2_PROMPTS
    idx = template_index % len(templates)
    return templates[idx].format(field=field, concept=concept)


def build_module3_prompt(field, template_index=0):
    """Build an image prompt for Module 3: Practical AI Skills."""
    templates = MODULE_3_PROMPTS
    idx = template_index % len(templates)
    return templates[idx].format(field=field)


def load_images_from_folder(folder_path, size=(512, 512)):
    """Load and resize all images from a folder for fine-tuning datasets."""
    images = []
    valid_extensions = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}

    for filename in sorted(os.listdir(folder_path)):
        ext = os.path.splitext(filename)[1].lower()
        if ext in valid_extensions:
            path = os.path.join(folder_path, filename)
            img = Image.open(path).convert("RGB").resize(size)
            images.append(img)

    return images


def save_frames_as_gif(frames, output_path, duration=100):
    """Save a list of PIL images as an animated GIF."""
    if not frames:
        return None
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
    )
    return output_path
