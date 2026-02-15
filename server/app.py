"""
AI Backend Server for the Learning Platform
Supports: Local llama.cpp (fine-tuned), IBM watsonx.ai (cloud).
Set AI_MODE in .env to 'local' or 'watsonx'.
"""

import os
import json
import re
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

# ---- Config ----
AI_MODE = os.getenv("AI_MODE", "local").strip().strip('"')  # 'local' or 'watsonx'
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "model.gguf")).strip().strip('"')
IBM_API_KEY = os.getenv("IBM_API_KEY", "").strip().strip('"')
IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID", "").strip().strip('"')
IBM_URL = os.getenv("IBM_URL", "https://us-south.ml.cloud.ibm.com").strip().strip('"')
MODEL_ID = os.getenv("MODEL_ID", "meta-llama/llama-3-3-70b-instruct").strip().strip('"')
HF_TOKEN = os.getenv("HF_TOKEN", "").strip().strip('"')

# Cache the access token
_token_cache = {"token": None}

# ============================================
# LOCAL (llama-cpp-python — runs in-process)
# ============================================
_local_model = None

def get_local_model():
    """Load the GGUF model once, reuse for all requests."""
    global _local_model
    if _local_model is None:
        from llama_cpp import Llama
        print(f"📦 Loading model from {MODEL_PATH}...")
        _local_model = Llama(
            model_path=MODEL_PATH,
            n_ctx=4096,
            n_threads=4,
            verbose=False,
        )
        print("✅ Model loaded!")
    return _local_model

def call_local(prompt: str, system_prompt: str = "", max_tokens: int = 4000) -> str:
    """Run inference on the local fine-tuned model."""
    llm = get_local_model()
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    result = llm.create_chat_completion(
        messages=messages,
        max_tokens=max_tokens,
        temperature=0.7,
        top_p=0.9,
    )
    return result["choices"][0]["message"]["content"]


# ============================================
# WATSONX (Cloud)
# ============================================
def get_access_token():
    """Exchange API key for a bearer token."""
    if _token_cache["token"]:
        return _token_cache["token"]

    resp = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={IBM_API_KEY}",
    )
    resp.raise_for_status()
    _token_cache["token"] = resp.json()["access_token"]
    return _token_cache["token"]


def call_watsonx(prompt: str, max_tokens: int = 4000) -> str:
    """Send a prompt to watsonx.ai. Retries on rate limit."""
    max_retries = 5

    for attempt in range(max_retries):
        token = get_access_token()

        payload = {
            "model_id": MODEL_ID,
            "input": prompt,
            "parameters": {
                "decoding_method": "sample",
                "max_new_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 0.9,
                "repetition_penalty": 1.1,
            },
            "project_id": IBM_PROJECT_ID,
        }

        resp = requests.post(
            f"{IBM_URL}/ml/v1/text/generation?version=2023-05-29",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json=payload,
        )

        if resp.status_code == 401:
            _token_cache["token"] = None
            continue

        if resp.status_code == 429:
            wait_time = 2 ** attempt
            print(f"⏳ Rate limited, waiting {wait_time}s (attempt {attempt + 1}/{max_retries})")
            time.sleep(wait_time)
            continue

        if not resp.ok:
            print(f"❌ watsonx error {resp.status_code}: {resp.text}")
        resp.raise_for_status()
        result = resp.json()
        return result["results"][0]["generated_text"]

    raise Exception("Max retries reached for watsonx API")


# ============================================
# UNIFIED CALL — picks ollama or watsonx
# ============================================
SYSTEM_PROMPT = "You are an AI education tutor that generates personalized learning content. Return JSON."

def call_ai(user_prompt: str, system_prompt: str = SYSTEM_PROMPT, max_tokens: int = 4000) -> str:
    """Route to the correct AI backend."""
    if AI_MODE == "local":
        return call_local(user_prompt, system_prompt, max_tokens)
    else:
        # watsonx uses the Llama chat template format
        full_prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>
{user_prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
        return call_watsonx(full_prompt, max_tokens)


def extract_json(text: str):
    """Try to extract JSON from the model's response text."""
    # Try to find JSON in code blocks first
    code_block = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if code_block:
        try:
            return json.loads(code_block.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try to find raw JSON (object or array)
    for pattern in [r"\{[\s\S]*\}", r"\[[\s\S]*\]"]:
        match = re.search(pattern, text)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                continue

    # Return raw text if no JSON found
    return None


# ============================================
# ENDPOINT 1: Welcome Message
# ============================================
@app.route("/api/welcome", methods=["POST"])
def welcome():
    data = request.json
    user_name = data.get("userName", "Student")
    profile = data.get("profile", {})

    system = (
        "You are a warm, encouraging AI tutor for a university learning platform. "
        "Generate a short personalized welcome message (2-3 sentences). "
        f"Be encouraging but not cheesy. Use a {profile.get('tonePreference', 'balanced')} tone. "
        "Return ONLY the welcome message text, nothing else."
    )

    user_msg = (
        f"Generate a welcome message for {user_name}. "
        f"They are a {profile.get('year', '')} year {profile.get('field', '')} student "
        f"interested in {profile.get('career', '')}. "
        f"Their profile label is: {profile.get('label', 'Learner')}. "
        f"Their biggest concern about AI is: {profile.get('primaryFear', 'unknown')}."
    )

    try:
        result = call_ai(user_msg, system, max_tokens=200)
        return jsonify({"message": result.strip()})
    except Exception as e:
        print(f"Error generating welcome: {e}")
        return jsonify({"message": f"Welcome, {user_name}! Your personalized learning path is ready."}), 200


# ============================================
# ENDPOINT 2: Module Content
# ============================================
@app.route("/api/module-content", methods=["POST"])
def module_content():
    data = request.json
    module_id = data.get("moduleId", "module1")
    profile = data.get("profile", {})

    field = profile.get("field", "your field")
    year = profile.get("year", "")
    career = profile.get("career", "your career")
    learning_format = profile.get("learningFormat", "visual")
    dependency = profile.get("dependencyLevel", "moderate")
    fear = profile.get("primaryFear", "unknown")

    module_topics = {
        "module1": {
            "title": "What Makes YOU Irreplaceable",
            "topic": "Purpose vs Task mindset — understanding what AI can and cannot replace",
            "video_topic": f"What Makes YOU Irreplaceable in {field}",
            "infographic_topic": f"Skills AI Can't Replace in {field}",
            "scenario_topic": f"Purpose vs Task in Action for {career}",
        },
        "module2": {
            "title": "Navigate AI Uncertainty",
            "topic": "VUCA world, AI media literacy, decision-making under uncertainty",
            "video_topic": f"Your Industry in 2030: What Changes, What Stays Human in {field}",
            "infographic_topic": "How to Spot AI-Generated Misinformation",
            "scenario_topic": f"Decision-Making Under Uncertainty as a {career}",
        },
        "module3": {
            "title": "Practical AI Skills",
            "topic": "Good vs bad AI usage, prompt engineering, AI ethics",
            "video_topic": f"Good vs Bad AI Usage in {field}",
            "infographic_topic": f"Prompt Engineering for {field}",
            "scenario_topic": f"AI Ethics in Practice for {career}",
        },
    }

    mod = module_topics.get(module_id, module_topics["module1"])

    system = (
        f"You are an expert AI education content creator. Generate educational module content as a JSON object. "
        f"The student is a {year} year {field} student interested in becoming a {career}. "
        f"Their AI dependency level is {dependency}. Their biggest fear about AI is {fear}. "
        f"Their preferred learning format is {learning_format}. "
        f"You MUST return ONLY a valid JSON object with this exact structure: "
        f'{{"sections": ['
        f'{{"type": "video", "title": "{mod["video_topic"]}", "content": "Markdown formatted video script (300+ words, use ### headings, **bold**, bullet points)"}}, '
        f'{{"type": "infographic", "title": "{mod["infographic_topic"]}", "content": "Brief intro sentence", "items": ["emoji Item 1 — Description", "emoji Item 2 — Description", "emoji Item 3 — Description", "emoji Item 4 — Description", "emoji Item 5 — Description", "emoji Item 6 — Description"]}}, '
        f'{{"type": "scenario", "title": "{mod["scenario_topic"]}", "content": "Markdown formatted scenario (200+ words, include ### Scenario heading, bold text, compare reactive vs adaptive approaches)"}}, '
        f'{{"type": "takeaways", "title": "Key Takeaways", "content": "What to remember from this module:", "items": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4", "Takeaway 5"]}}'
        f']}}'
        f" Return ONLY the JSON. No explanations, no markdown code blocks, just the raw JSON object."
    )

    user_msg = (
        f"Generate the content for module: {mod['title']}. "
        f"Topic: {mod['topic']}. "
        f"Make it deeply personalized for a {year} year {field} student interested in {career}. "
        f"Address their fear of {fear} thoughtfully."
    )

    try:
        result = call_ai(user_msg, system, max_tokens=4000)
        parsed = extract_json(result)

        if parsed and "sections" in parsed:
            parsed["generatedAt"] = __import__("datetime").datetime.now().isoformat()
            return jsonify(parsed)
        else:
            # If parsing fails, return the raw text wrapped in a basic structure
            print(f"JSON parse failed, raw output: {result[:500]}")
            return jsonify({
                "sections": [
                    {"type": "video", "title": mod["video_topic"], "content": result},
                    {"type": "infographic", "title": mod["infographic_topic"], "content": "Content generation partially succeeded.", "items": []},
                    {"type": "scenario", "title": mod["scenario_topic"], "content": "Please try regenerating this module."},
                    {"type": "takeaways", "title": "Key Takeaways", "content": "Module content needs regeneration.", "items": []},
                ],
                "generatedAt": __import__("datetime").datetime.now().isoformat(),
            })
    except Exception as e:
        print(f"Error generating module content: {e}")
        return jsonify({"error": str(e)}), 500


# ============================================
# ENDPOINT 3: Quiz Questions
# ============================================
@app.route("/api/quiz", methods=["POST"])
def quiz():
    data = request.json
    module_id = data.get("moduleId", "module1")
    profile = data.get("profile", {})

    field = profile.get("field", "your field")
    year = profile.get("year", "")
    career = profile.get("career", "your career")
    dependency = profile.get("dependencyLevel", "moderate")

    module_names = {
        "module1": "What Makes You Irreplaceable (Purpose vs Task mindset)",
        "module2": "Navigate AI Uncertainty (VUCA, media literacy)",
        "module3": "Practical AI Skills (prompt engineering, AI ethics)",
    }
    module_name = module_names.get(module_id, module_names["module1"])

    system = (
        f"You are a quiz generator for an AI education platform. Generate exactly 5 multiple choice questions. "
        f"The student is a {year} year {field} student interested in {career}. AI dependency: {dependency}. "
        f"Module topic: {module_name}. "
        f"Return ONLY a valid JSON array with this exact structure: "
        f'[{{"id": 1, "question": "The question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0, "explanation": "Brief explanation"}}] '
        f"Make questions: Relevant to {field} and {career}. Testing understanding, not memorization. "
        f"Increasing difficulty (easy to moderate). Include real-world application questions. "
        f"Return ONLY the JSON array. No explanations, no code blocks."
    )

    user_msg = f"Generate 5 quiz questions for module: {module_name}"

    try:
        result = call_ai(user_msg, system, max_tokens=2000)
        parsed = extract_json(result)

        if parsed and isinstance(parsed, list) and len(parsed) > 0:
            # Ensure each question has the right structure
            clean_questions = []
            for i, q in enumerate(parsed[:5]):
                clean_questions.append({
                    "id": i + 1,
                    "question": q.get("question", f"Question {i+1}"),
                    "options": q.get("options", ["A", "B", "C", "D"])[:4],
                    "correctIndex": q.get("correctIndex", 0),
                    "explanation": q.get("explanation", ""),
                })
            return jsonify(clean_questions)
        else:
            print(f"Quiz JSON parse failed: {result[:500]}")
            return jsonify({"error": "Failed to parse quiz questions"}), 500
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"error": str(e)}), 500


# ============================================
# ENDPOINT 4: Image Generation (HF Inference API + optional local Claire LoRA)
# ============================================
import sys
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

@app.route("/api/generate-image", methods=["POST"])
def generate_image():
    data = request.json
    prompt = data.get("prompt", "educational infographic")

    style_suffix = "clean modern design, professional, university educational material, high quality, detailed, flat design illustration"
    full_prompt = f"{prompt}, {style_suffix}"

    if not HF_TOKEN or HF_TOKEN == "your_hf_token_here":
        print("⚠️  No HF_TOKEN set, skipping image generation")
        return jsonify({"imageUrl": None, "error": "No HF token configured"}), 200

    try:
        print(f"🎨 Generating image: {full_prompt[:80]}...")
        import hashlib
        resp = requests.post(
            "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={"inputs": full_prompt},
            timeout=60,
        )

        if resp.status_code == 503:
            return jsonify({"imageUrl": None, "loading": True, "error": "Model is warming up, try again in 30s"}), 200

        if resp.status_code != 200:
            print(f"❌ HF error {resp.status_code}: {resp.text[:200]}")
            return jsonify({"imageUrl": None, "error": f"HF API error {resp.status_code}"}), 200

        gen_dir = os.path.join(PROJECT_ROOT, "public", "generated")
        os.makedirs(gen_dir, exist_ok=True)
        filename = hashlib.md5(full_prompt.encode()).hexdigest()[:12] + ".png"
        filepath = os.path.join(gen_dir, filename)
        with open(filepath, "wb") as f:
            f.write(resp.content)

        image_url = f"http://localhost:5001/images/{filename}"
        print(f"✅ Image saved: {filepath}")
        return jsonify({"imageUrl": image_url})

    except Exception as e:
        print(f"Error generating image: {e}")
        return jsonify({"imageUrl": None, "error": str(e)}), 200


# Serve generated images
@app.route("/images/<filename>", methods=["GET"])
def serve_image(filename):
    from flask import send_from_directory
    gen_dir = os.path.join(PROJECT_ROOT, "public", "generated")
    return send_from_directory(gen_dir, filename)


# ============================================
# ENDPOINT 5: VUCA Scenario Simulator
# ============================================
def _fallback_scenario(round_num):
    scenarios = [
        {
            "scenario": "Your professor just announced a zero-tolerance policy on AI-generated content. Your partner on a major project admits they used ChatGPT for their entire section. The deadline is tomorrow.",
            "vuca_factors": ["uncertainty", "complexity"],
            "choices": [
                {"id": "a", "text": "Confront your partner and insist they rewrite everything", "approach": "Ethical Leader"},
                {"id": "b", "text": "Report it to the professor before submission", "approach": "Rule Follower"},
                {"id": "c", "text": "Help them rewrite the AI parts in their own words tonight", "approach": "Pragmatic Collaborator"},
            ],
            "round": 1, "total_rounds": 3,
        },
        {
            "scenario": "Word has spread about the incident. Students are divided on AI policies. A petition is circulating, and your professor asks YOU in front of the class: 'What should our AI policy be?'",
            "vuca_factors": ["volatility", "ambiguity"],
            "choices": [
                {"id": "a", "text": "Argue for clear guidelines allowing AI as a tool with mandatory disclosure", "approach": "Systems Thinker"},
                {"id": "b", "text": "Support the ban — students need to build skills without AI crutches", "approach": "Traditionalist"},
                {"id": "c", "text": "Suggest the class votes and decides democratically", "approach": "Democratic Leader"},
            ],
            "round": 2, "total_rounds": 3,
        },
        {
            "scenario": "The university is now drafting a campus-wide AI policy and wants student reps. You've been nominated. A tech company offers free AI tools — but only if the university drops ALL restrictions.",
            "vuca_factors": ["volatility", "uncertainty", "complexity", "ambiguity"],
            "choices": [
                {"id": "a", "text": "Accept the tools but require mandatory AI literacy training first", "approach": "Strategic Thinker"},
                {"id": "b", "text": "Reject the corporate offer to keep education independent", "approach": "Ethical Guardian"},
                {"id": "c", "text": "Propose a one-semester pilot with strict monitoring", "approach": "Adaptive Innovator"},
            ],
            "round": 3, "total_rounds": 3,
        },
    ]
    return scenarios[min(round_num - 1, 2)]


@app.route("/api/scenario", methods=["POST"])
def generate_scenario():
    data = request.json
    profile = data.get("profile", {})
    round_num = data.get("round", 1)
    previous_choice = data.get("previousChoice")
    scenario_context = data.get("scenarioContext", "")

    context_block = ""
    if previous_choice and scenario_context:
        context_block = f"\nPrevious context: {scenario_context}\nThe student chose: \"{previous_choice}\"\nNow create the NEXT scenario that follows from that choice."

    prompt = f"""You are a VUCA scenario generator for university students learning about AI.
Create a realistic, branching scenario for Round {round_num} of 3.
Student profile: {profile.get('program', 'university student')}, AI comfort: {profile.get('aiComfort', 'moderate')}.
{context_block}

Return ONLY valid JSON:
{{"scenario": "2-3 sentence scenario description", "vuca_factors": ["volatility"|"uncertainty"|"complexity"|"ambiguity"], "choices": [{{"id": "a", "text": "choice text", "approach": "approach label"}}, {{"id": "b", "text": "choice text", "approach": "approach label"}}, {{"id": "c", "text": "choice text", "approach": "approach label"}}], "round": {round_num}, "total_rounds": 3}}"""

    try:
        result = call_ai(prompt, max_tokens=600)
        parsed = extract_json(result)
        if parsed and "scenario" in parsed and "choices" in parsed:
            parsed["round"] = round_num
            parsed["total_rounds"] = 3
            return jsonify(parsed)
    except Exception as e:
        print(f"Scenario generation error: {e}")

    return jsonify(_fallback_scenario(round_num))


@app.route("/api/scenario-debrief", methods=["POST"])
def scenario_debrief():
    data = request.json
    profile = data.get("profile", {})
    choices_made = data.get("choicesMade", [])

    choices_desc = "\n".join(
        [f"Round {c['round']}: chose \"{c['choice_text']}\" ({c['approach']})" for c in choices_made]
    )

    prompt = f"""Analyze this student's VUCA scenario simulation choices.
Student: {profile.get('program', 'student')}, AI comfort: {profile.get('aiComfort', 'moderate')}.

Choices made:
{choices_desc}

Return ONLY valid JSON:
{{"badge": "a creative 2-3 word title for their decision style", "summary": "2-3 sentence personalized analysis", "strengths": ["strength 1", "strength 2"], "growth_areas": ["area 1", "area 2"], "vuca_readiness_score": 0-100}}"""

    try:
        result = call_ai(prompt, max_tokens=400)
        parsed = extract_json(result)
        if parsed and "badge" in parsed:
            return jsonify(parsed)
    except Exception as e:
        print(f"Debrief generation error: {e}")

    approaches = [c.get("approach", "") for c in choices_made]
    return jsonify({
        "badge": "Adaptive Learner",
        "summary": "You navigated uncertainty with thoughtful decision-making. Your choices show a blend of caution and initiative.",
        "strengths": ["Willingness to engage with complex scenarios", "Consistent decision-making approach"],
        "growth_areas": ["Consider more diverse stakeholder perspectives", "Explore bolder approaches to uncertainty"],
        "vuca_readiness_score": 72,
    })


# ============================================
# Health check
# ============================================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "ai_mode": AI_MODE,
        "model": "llama-3.2-3b (fine-tuned)" if AI_MODE == "local" else MODEL_ID,
        "has_api_key": bool(IBM_API_KEY),
        "has_project_id": bool(IBM_PROJECT_ID),
    })


if __name__ == "__main__":
    print(f"🚀 Starting AI Backend Server")
    print(f"   AI Mode: {AI_MODE}")
    if AI_MODE == "local":
        print(f"   Model file: {MODEL_PATH}")
        # Pre-load the model on startup so first request isn't slow
        get_local_model()
    else:
        print(f"   watsonx Model: {MODEL_ID}")
        print(f"   API Key: {'✅ Set' if IBM_API_KEY else '❌ Missing'}")
        print(f"   Project ID: {IBM_PROJECT_ID if IBM_PROJECT_ID else '❌ Missing'}")
    print(f"   HF Token: {'✅ Set' if HF_TOKEN and HF_TOKEN != 'your_hf_token_here' else '❌ Missing (no images)'}")
    app.run(host="0.0.0.0", port=5001, debug=False)
