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
# ENDPOINT 4: Image Generation (Stable Diffusion)
# ============================================
@app.route("/api/generate-image", methods=["POST"])
def generate_image():
    data = request.json
    prompt = data.get("prompt", "educational infographic")
    section_type = data.get("sectionType", "infographic")

    # Build a better prompt for educational visuals
    style_suffix = "clean modern design, professional, university educational material, high quality, detailed, flat design illustration"
    full_prompt = f"{prompt}, {style_suffix}"

    if not HF_TOKEN or HF_TOKEN == "your_hf_token_here":
        print("⚠️  No HF_TOKEN set, skipping image generation")
        return jsonify({"imageUrl": None, "error": "No HF token configured"}), 200

    try:
        print(f"🎨 Generating image: {full_prompt[:80]}...")
        resp = requests.post(
            "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={"inputs": full_prompt},
            timeout=90,
        )

        if resp.status_code == 503:
            # Model is loading, tell frontend to retry
            return jsonify({"imageUrl": None, "loading": True, "error": "Model is warming up, try again in 30s"}), 200

        if resp.status_code != 200:
            print(f"❌ HF error {resp.status_code}: {resp.text[:200]}")
            return jsonify({"imageUrl": None, "error": f"HF API error {resp.status_code}"}), 200

        # Save the image to public/generated/
        import base64
        import hashlib
        os.makedirs("public/generated", exist_ok=True)
        filename = hashlib.md5(full_prompt.encode()).hexdigest()[:12] + ".png"
        filepath = os.path.join("public", "generated", filename)
        with open(filepath, "wb") as f:
            f.write(resp.content)

        # Return a URL the frontend can use
        image_url = f"http://localhost:5001/images/{filename}"
        print(f"✅ Image saved: {filepath}")
        return jsonify({"imageUrl": image_url})

    except Exception as e:
        print(f"Error generating image: {e}")
        return jsonify({"imageUrl": None, "error": str(e)}), 200


# ============================================
# ENDPOINT 5: VUCA Scenario Simulator
# ============================================
@app.route("/api/scenario", methods=["POST"])
def scenario():
    data = request.json
    profile = data.get("profile", {})
    scenario_round = data.get("round", 1)         # 1, 2, or 3
    previous_choice = data.get("previousChoice", None)
    scenario_context = data.get("scenarioContext", "")
    module_id = data.get("moduleId", "module2")     # which module triggered it

    field = profile.get("field", "your field")
    year = profile.get("year", "")
    career = profile.get("career", "your career")
    fear = profile.get("primaryFear", "unknown")

    system = (
        "You are an AI education scenario designer specializing in VUCA (Volatility, Uncertainty, Complexity, Ambiguity) simulations. "
        f"The student is a {year} year {field} student who wants to become a {career}. "
        f"Their biggest concern about AI is: {fear}. "
        "Create realistic, thought-provoking scenarios that university students actually face regarding AI. "
        "You MUST return ONLY a valid JSON object with this EXACT structure, nothing else: "
        '{"scenario": "A 2-3 sentence description of the situation the student faces",'
        ' "vuca_factors": ["volatility"|"uncertainty"|"complexity"|"ambiguity"],'
        ' "choices": [{"id": "a", "text": "Choice text", "approach": "1-2 word label like Risk-Taker or Critical Thinker"}, '
        '{"id": "b", "text": "Choice text", "approach": "label"}, '
        '{"id": "c", "text": "Choice text", "approach": "label"}],'
        ' "round": <round_number>, "total_rounds": 3}'
    )

    if scenario_round == 1:
        user_msg = (
            f"Generate Round 1 of a VUCA scenario simulation. "
            f"Create a realistic dilemma that a {field} student faces related to AI in their academic or early career life. "
            f"Make it personal and relatable — something that could happen THIS semester. "
            f"Examples: AI plagiarism dilemma, AI screening in internship applications, deepfake news on campus, AI replacing skills they are learning. "
            f"Tailor it to their field of {field} and career goal of {career}."
        )
    else:
        user_msg = (
            f"Generate Round {scenario_round} of a VUCA scenario simulation. "
            f"Previous context: {scenario_context} "
            f"The student chose: {previous_choice}. "
            f"Now generate the CONSEQUENCES of that choice and present a NEW, escalated dilemma. "
            f"The stakes should be higher than the previous round. Make it feel like a branching story. "
            f"This is round {scenario_round} of 3."
        )

    try:
        result = call_ai(user_msg, system, max_tokens=800)
        parsed = extract_json(result)
        if parsed:
            parsed["round"] = scenario_round
            parsed["total_rounds"] = 3
            return jsonify(parsed)
        else:
            print(f"⚠️  Could not parse scenario JSON: {result[:200]}")
            return jsonify(_fallback_scenario(scenario_round, field, career))
    except Exception as e:
        print(f"Error generating scenario: {e}")
        return jsonify(_fallback_scenario(scenario_round, field, career))


@app.route("/api/scenario-debrief", methods=["POST"])
def scenario_debrief():
    data = request.json
    profile = data.get("profile", {})
    choices_made = data.get("choicesMade", [])  # list of {round, choice_text, approach}

    field = profile.get("field", "your field")
    career = profile.get("career", "your career")

    system = (
        "You are an AI education debrief coach. Based on the student's choices in a VUCA scenario simulation, "
        "generate a personalized debrief. "
        "You MUST return ONLY a valid JSON object with this EXACT structure: "
        '{"badge": "A 2-3 word title like Critical Thinker or Ethical Navigator or Adaptive Leader",'
        ' "summary": "2-3 sentences about their decision-making pattern",'
        ' "strengths": ["strength 1", "strength 2"],'
        ' "growth_areas": ["area 1", "area 2"],'
        ' "vuca_readiness_score": <number 1-100>}'
    )

    choices_text = "; ".join([f"Round {c.get('round')}: chose '{c.get('choice_text')}' ({c.get('approach')})" for c in choices_made])
    user_msg = (
        f"A {field} student pursuing {career} just completed a 3-round VUCA AI scenario simulation. "
        f"Their choices were: {choices_text}. "
        f"Generate a personalized debrief based on their decision patterns."
    )

    try:
        result = call_ai(user_msg, system, max_tokens=600)
        parsed = extract_json(result)
        if parsed:
            return jsonify(parsed)
        else:
            return jsonify({
                "badge": "Adaptive Learner",
                "summary": f"You showed real awareness of AI challenges in {field}. Your choices reflect a balanced approach to navigating uncertainty.",
                "strengths": ["Willingness to adapt", "Ethical awareness"],
                "growth_areas": ["Consider long-term consequences", "Seek more data before deciding"],
                "vuca_readiness_score": 72
            })
    except Exception as e:
        print(f"Error generating debrief: {e}")
        return jsonify({
            "badge": "Adaptive Learner",
            "summary": "You completed the simulation with thoughtful choices.",
            "strengths": ["Adaptability", "Critical thinking"],
            "growth_areas": ["Decision speed", "Risk assessment"],
            "vuca_readiness_score": 70
        })


def _fallback_scenario(round_num, field, career):
    scenarios = [
        {
            "scenario": f"Your {field} professor just announced that any assignment containing AI-generated content will receive an automatic zero. Your classmate, who you're paired with for a major project worth 30% of your grade, tells you they've been using ChatGPT for all their research summaries. The deadline is in 48 hours.",
            "vuca_factors": ["uncertainty", "complexity"],
            "choices": [
                {"id": "a", "text": "Confront your classmate and insist they redo their work without AI", "approach": "Ethical Leader"},
                {"id": "b", "text": "Report the situation to your professor before the deadline", "approach": "Rule Follower"},
                {"id": "c", "text": "Help your classmate rewrite the AI parts in their own words before submitting", "approach": "Pragmatic Collaborator"}
            ],
            "round": 1, "total_rounds": 3
        },
        {
            "scenario": f"After your choice, word has spread. Other students are divided — some think AI tools should be allowed, others agree with the zero-tolerance policy. A petition is circulating to change the policy. Your professor asks YOU specifically what you think, in front of the class.",
            "vuca_factors": ["volatility", "ambiguity"],
            "choices": [
                {"id": "a", "text": "Argue for clear guidelines that allow AI as a tool but require disclosure", "approach": "Systems Thinker"},
                {"id": "b", "text": "Support the ban — students need to develop skills without AI crutches", "approach": "Traditionalist"},
                {"id": "c", "text": "Suggest a class vote and let democracy decide the policy", "approach": "Democratic Leader"}
            ],
            "round": 2, "total_rounds": 3
        },
        {
            "scenario": f"The university administration has now gotten involved. They're drafting a campus-wide AI policy and want student input. You've been nominated to represent your faculty. A tech company has also reached out offering free AI tools to students — but only if the university drops its restrictions. As a future {career}, you realize this decision will shape how your entire generation learns.",
            "vuca_factors": ["volatility", "uncertainty", "complexity", "ambiguity"],
            "choices": [
                {"id": "a", "text": "Accept the tools but push for mandatory AI literacy training first", "approach": "Strategic Thinker"},
                {"id": "b", "text": "Reject the corporate offer to keep education independent from tech influence", "approach": "Ethical Guardian"},
                {"id": "c", "text": "Propose a pilot program — accept for one semester with strict monitoring", "approach": "Adaptive Innovator"}
            ],
            "round": 3, "total_rounds": 3
        }
    ]
    return scenarios[min(round_num - 1, 2)]


# Serve generated images
@app.route("/images/<filename>", methods=["GET"])
def serve_image(filename):
    from flask import send_from_directory
    return send_from_directory("public/generated", filename)


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
    app.run(host="0.0.0.0", port=5001, debug=True)
