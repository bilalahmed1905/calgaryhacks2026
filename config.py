import os


# --- Hugging Face API ---
HF_TOKEN = os.environ.get("HF_TOKEN", "")

# --- Model IDs (used via HF Inference API, not loaded locally) ---
IMAGE_MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
VIDEO_MODEL_ID = "ali-vilab/text-to-video-ms-1.7b"

# --- HF Inference API URLs ---
IMAGE_API_URL = f"https://api-inference.huggingface.co/models/{IMAGE_MODEL_ID}"
VIDEO_API_URL = f"https://api-inference.huggingface.co/models/{VIDEO_MODEL_ID}"

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
