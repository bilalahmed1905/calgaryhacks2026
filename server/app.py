"""
ClarityPath Flask Server
========================
- Local Llama 3B (model.gguf) for text generation via llama-cpp-python
- Local SDXL + LoRA for image generation via image_gen.py
- Endpoints: /api/welcome, /api/module-content, /api/generate-image, /api/quiz
- Image serving: /images/<filename>
"""

import os
import sys
import json
import re
import traceback

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Path setup: add project root so we can import image_gen, config, etc.
# ---------------------------------------------------------------------------
SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SERVER_DIR)
sys.path.insert(0, PROJECT_ROOT)

from image_gen import generate_image  # noqa: E402

load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(PROJECT_ROOT, "model.gguf")
IMAGE_OUTPUT_DIR = os.path.join(PROJECT_ROOT, "outputs", "images")
os.makedirs(IMAGE_OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Local Llama model (loaded once, reused)
# ---------------------------------------------------------------------------
_llm = None


def _load_llm():
    """Load the Llama 3B GGUF model. Cached after first call."""
    global _llm
    if _llm is not None:
        return _llm

    from llama_cpp import Llama

    print(f"Loading Llama model from {MODEL_PATH} ...")
    _llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=2048,
        n_threads=4,
        verbose=False,
    )
    print("Llama model loaded.")
    return _llm


def call_local(prompt: str, max_tokens: int = 1024, temperature: float = 0.7) -> str:
    """Generate text using the local Llama 3B model."""
    llm = _load_llm()
    output = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        stop=["</s>", "\n\n\n"],
    )
    return output["choices"][0]["text"].strip()


def call_watsonx(prompt: str) -> str:
    """Cloud fallback via WatsonX (placeholder).

    Uses environment variables WATSONX_API_KEY, WATSONX_PROJECT_ID, etc.
    Returns the generated text or raises on failure.
    """
    import requests

    api_key = os.environ.get("WATSONX_API_KEY", "")
    project_id = os.environ.get("WATSONX_PROJECT_ID", "")
    url = os.environ.get(
        "WATSONX_URL",
        "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2024-03-14",
    )

    if not api_key or not project_id:
        raise RuntimeError("WatsonX credentials not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "model_id": "meta-llama/llama-3-8b-instruct",
        "input": prompt,
        "parameters": {"max_new_tokens": 1024, "temperature": 0.7},
        "project_id": project_id,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    return resp.json()["results"][0]["generated_text"].strip()


def generate_text(prompt: str, max_tokens: int = 1024) -> str:
    """Try local model first, fall back to WatsonX."""
    try:
        return call_local(prompt, max_tokens=max_tokens)
    except Exception as e:
        print(f"[WARN] Local model failed: {e}. Trying WatsonX fallback...")
        try:
            return call_watsonx(prompt)
        except Exception as e2:
            print(f"[ERROR] WatsonX fallback also failed: {e2}")
            raise


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_json_from_text(text: str):
    """Extract the first JSON object or array from LLM output."""
    # Try to find JSON in code fences first
    fence_match = re.search(r"```(?:json)?\s*\n?([\s\S]*?)```", text)
    if fence_match:
        text = fence_match.group(1).strip()

    # Try to find a JSON object
    brace_start = text.find("{")
    bracket_start = text.find("[")

    if brace_start == -1 and bracket_start == -1:
        return None

    # Pick whichever comes first
    if brace_start == -1:
        start = bracket_start
    elif bracket_start == -1:
        start = brace_start
    else:
        start = min(brace_start, bracket_start)

    # Walk forward to find matching close
    depth = 0
    open_char = text[start]
    close_char = "}" if open_char == "{" else "]"
    for i in range(start, len(text)):
        if text[i] == open_char:
            depth += 1
        elif text[i] == close_char:
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start : i + 1])
                except json.JSONDecodeError:
                    return None
    return None


def _generate_images_for_sections(sections: list) -> list:
    """For 'video' and 'infographic' sections, generate an image and attach imageUrl."""
    enriched = []
    for section in sections:
        section_copy = dict(section)
        sec_type = section_copy.get("type", "")
        if sec_type in ("video", "infographic"):
            title = section_copy.get("title", "educational illustration")
            prompt = (
                f"professional educational illustration for: {title}, "
                "clean modern design, high quality, informative, minimalist style"
            )
            try:
                _pil_img, file_path = generate_image(prompt)
                if file_path:
                    filename = os.path.basename(file_path)
                    section_copy["imageUrl"] = f"http://localhost:5001/images/{filename}"
            except Exception as e:
                print(f"[WARN] Image generation failed for section '{title}': {e}")
        enriched.append(section_copy)
    return enriched


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/api/welcome", methods=["POST"])
def welcome():
    """Generate a personalized welcome message."""
    data = request.get_json(force=True)
    user_name = data.get("userName", "Student")
    profile = data.get("profile", {})

    field = profile.get("field", "your field")
    year = profile.get("year", "")
    career = profile.get("career", "your career")
    label = profile.get("label", "")
    tone = profile.get("tonePreference", "balanced")

    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are ClarityPath, a warm and encouraging career guidance AI for university students.
Generate a personalized welcome message. Be {tone}, authentic, and concise (2-3 sentences).
Do NOT use generic platitudes. Reference their specific field and interests.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Generate a welcome message for {user_name}.
Profile: {label}
Year: {year}, Field: {field}, Career interest: {career}
Keep it 2-3 sentences. Be encouraging but not cheesy.<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
"""

    try:
        message = generate_text(prompt, max_tokens=256)
        return jsonify({"message": message})
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "message": f"Welcome, {user_name}! We're excited to help you navigate your path in {field}. Let's get started on your personalized learning journey."
        }), 200


@app.route("/api/module-content", methods=["POST"])
def module_content():
    """Generate personalized module content with auto-generated images."""
    data = request.get_json(force=True)
    module_id = data.get("moduleId", "module1")
    profile = data.get("profile", {})

    field = profile.get("field", "your field")
    year = profile.get("year", "")
    career = profile.get("career", "your career")
    learning_format = profile.get("learningFormat", "hands_on")
    dependency_level = profile.get("dependencyLevel", "moderate")
    primary_fear = profile.get("primaryFear", "ai_relevance")

    # Module-specific topic
    module_topics = {
        "module1": f"What Makes YOU Irreplaceable in {field}",
        "module2": f"Navigate AI Uncertainty & VUCA World for {field}",
        "module3": f"Develop Practical AI Skills for {field}",
    }
    topic = module_topics.get(module_id, module_topics["module1"])

    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are ClarityPath, an AI educational content generator. You create personalized learning modules for university students about navigating AI in their careers.

You MUST respond with valid JSON only. No extra text before or after the JSON.

The JSON must have this exact structure:
{{
  "sections": [
    {{
      "type": "video",
      "title": "string",
      "content": "markdown string (300 words)"
    }},
    {{
      "type": "infographic",
      "title": "string",
      "content": "description string",
      "items": ["item1", "item2", "item3", "item4", "item5", "item6"]
    }},
    {{
      "type": "scenario",
      "title": "string",
      "content": "markdown string with scenario exercise"
    }},
    {{
      "type": "takeaways",
      "title": "Key Takeaways",
      "content": "summary line",
      "items": ["takeaway1", "takeaway2", "takeaway3", "takeaway4", "takeaway5"]
    }}
  ]
}}<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Generate educational content for a {year} year {field} student interested in {career}.
Their learning style is {learning_format}. Their AI dependency is {dependency_level}.
Their biggest career fear is {primary_fear}.

Topic: {topic}

Generate 4 sections:
1. A "video" section: script explaining the topic (300 words, markdown)
2. An "infographic" section: list 6 items relevant to {field}
3. A "scenario" section: practical exercise for {career}
4. A "takeaways" section: 4-5 key bullet points

Return ONLY valid JSON.<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
"""

    try:
        raw = generate_text(prompt, max_tokens=1024)
        parsed = _parse_json_from_text(raw)

        if parsed and "sections" in parsed:
            sections = parsed["sections"]
        elif isinstance(parsed, list):
            sections = parsed
        else:
            # If parsing fails, return a structured fallback
            raise ValueError("Could not parse JSON from model output")

        # Auto-generate images for video and infographic sections
        sections = _generate_images_for_sections(sections)

        return jsonify({
            "sections": sections,
            "generatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        })

    except Exception as e:
        traceback.print_exc()
        print(f"[ERROR] Module content generation failed: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/generate-image", methods=["POST"])
def generate_image_endpoint():
    """Generate an image using local SDXL + LoRA pipeline."""
    data = request.get_json(force=True)
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    try:
        pil_image, file_path = generate_image(prompt)

        if file_path:
            filename = os.path.basename(file_path)
            image_url = f"http://localhost:5001/images/{filename}"
            return jsonify({
                "imageUrl": image_url,
                "filename": filename,
            })
        else:
            return jsonify({"error": "Image generation succeeded but file was not saved"}), 500

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/quiz", methods=["POST"])
def quiz():
    """Generate quiz questions for a module."""
    data = request.get_json(force=True)
    module_id = data.get("moduleId", "module1")
    profile = data.get("profile", {})

    field = profile.get("field", "your field")
    year = profile.get("year", "")
    career = profile.get("career", "your career")
    dependency_level = profile.get("dependencyLevel", "moderate")

    module_topics = {
        "module1": "What Makes YOU Irreplaceable (purpose vs task mindset, human skills)",
        "module2": "Navigating AI Uncertainty & VUCA World (adaptability, media literacy)",
        "module3": "Practical AI Skills (good vs bad usage, prompt engineering, ethics)",
    }
    topic = module_topics.get(module_id, module_topics["module1"])

    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are ClarityPath quiz generator. Generate quiz questions for university students.
You MUST respond with valid JSON only. No extra text.

The JSON must be an array of objects with this structure:
[
  {{
    "id": 1,
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "string"
  }}
]<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Generate 5 multiple choice quiz questions for a {year} year {field} student interested in {career}.
Module topic: {topic}
Difficulty: adjusted for {dependency_level} AI usage level.

Each question should have 4 options, a correctIndex (0-3), and a brief explanation.
Return ONLY a valid JSON array.<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
"""

    try:
        raw = generate_text(prompt, max_tokens=1024)
        parsed = _parse_json_from_text(raw)

        if isinstance(parsed, list):
            questions = parsed
        elif isinstance(parsed, dict) and "questions" in parsed:
            questions = parsed["questions"]
        else:
            raise ValueError("Could not parse quiz JSON from model output")

        return jsonify({"questions": questions})

    except Exception as e:
        traceback.print_exc()
        print(f"[ERROR] Quiz generation failed: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/images/<path:filename>")
def serve_image(filename):
    """Serve generated images from the outputs/images directory."""
    return send_from_directory(IMAGE_OUTPUT_DIR, filename)


@app.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print(f"[ClarityPath] Server starting on port 5001")
    print(f"[ClarityPath] Project root: {PROJECT_ROOT}")
    print(f"[ClarityPath] Model path:   {MODEL_PATH}")
    print(f"[ClarityPath] Image output:  {IMAGE_OUTPUT_DIR}")
    app.run(host="0.0.0.0", port=5001, debug=True)
