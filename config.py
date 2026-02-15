import os
import torch


# --- Hugging Face API ---
HF_TOKEN = os.environ.get("HF_TOKEN", "")

# --- Model IDs ---
IMAGE_MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
VIDEO_MODEL_ID = "ali-vilab/text-to-video-ms-1.7b"

# --- Device Detection (MPS for Apple Silicon, else CPU) ---
if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
elif torch.cuda.is_available():
    DEVICE = torch.device("cuda")
else:
    DEVICE = torch.device("cpu")

TORCH_DTYPE = torch.float32 if DEVICE.type == "mps" else torch.float16

# --- Generation Defaults ---
IMAGE_DEFAULTS = {
    "num_inference_steps": 30,
    "guidance_scale": 7.5,
    "width": 1024,
    "height": 1024,
}

VIDEO_DEFAULTS = {
    "num_inference_steps": 25,
    "num_frames": 16,
    "width": 256,
    "height": 256,
}

# --- Output Directories ---
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
IMAGE_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "images")
VIDEO_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "videos")
LORA_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "lora_weights")

for d in [IMAGE_OUTPUT_DIR, VIDEO_OUTPUT_DIR, LORA_OUTPUT_DIR]:
    os.makedirs(d, exist_ok=True)

# --- Ascend Ignite Module Prompt Templates ---
SKILLS_ASSESSMENT_PROMPTS = [
    "professional illustration of a university student discovering their career path in {field}, modern flat design, educational",
    "clean infographic style image showing skills and competencies for {field}, professional, minimal",
    "motivational scene of a young professional succeeding in {field}, diverse, modern, inspiring",
]

VUCA_PROMPTS = [
    "abstract illustration representing {concept} in career planning, modern design, educational",
    "visual metaphor for navigating {concept} as a university student, clean, professional",
    "educational diagram showing strategies for handling {concept}, minimal, clear",
]
