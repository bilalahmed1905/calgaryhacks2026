import os


# --- Hugging Face API ---
HF_TOKEN = os.environ.get("HF_TOKEN", "")

# --- Model IDs ---
IMAGE_MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
VIDEO_MODEL_ID = "ali-vilab/text-to-video-ms-1.7b"

# --- HF Inference API URLs (used for video only) ---
VIDEO_API_URL = f"https://api-inference.huggingface.co/models/{VIDEO_MODEL_ID}"

# --- LoRA weights ---
# Option 1: HuggingFace Hub repo ID (works on any machine, set this after running Colab step 9)
LORA_HF_REPO = os.environ.get("LORA_HF_REPO", "bilalahmed927/Claire")

# Option 2: Local path (from Colab step 8 zip download)
LORA_WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "outputs", "lora_weights", "claritypath_lora")

# --- Output Directories ---
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
IMAGE_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "images")
VIDEO_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "videos")
LORA_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "lora_weights")

for d in [IMAGE_OUTPUT_DIR, VIDEO_OUTPUT_DIR, LORA_OUTPUT_DIR]:
    os.makedirs(d, exist_ok=True)

# --- ClarityPath Module Prompt Templates ---

# Module 1: Build Confidence Through Skills Discovery
MODULE_1_PROMPTS = [
    "university student confidently presenting their unique skills to employers, {field}, warm lighting, professional photography",
    "young professional building a portfolio of irreplaceable human skills in {field}, real workplace setting, motivational",
    "student having a breakthrough moment discovering their career strengths in {field}, candid, authentic, inspiring",
]

# Module 2: Navigate AI Uncertainty & VUCA World
MODULE_2_PROMPTS = [
    "university student navigating career uncertainty with confidence, {concept}, real world setting, determined, professional",
    "young professional adapting to rapid change in {field}, split view of traditional and AI-augmented work, authentic",
    "student making a career decision at a crossroads, multiple paths ahead, {concept}, hopeful, real setting",
]

# Module 3: Develop Practical AI Skills
MODULE_3_PROMPTS = [
    "university student using AI tools effectively in {field}, laptop with AI interface, collaborative workspace, authentic",
    "young professional ethically integrating AI into their {field} workflow, hands-on, real workspace, focused",
    "student learning prompt engineering on their computer, {field} context, modern study environment, natural lighting",
]
