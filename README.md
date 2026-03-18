# ClarityPath ReadMe
# Readme

**AI-powered career development platform for university students.**

Built for CalgaryHacks 2026 — helps students discover their strengths, navigate AI uncertainty, and build practical AI skills through personalized learning modules.

## What It Does

ClarityPath guides students through 3 interactive modules, each personalized to their field of study, career goals, and comfort level with AI:
 P
1. **What Makes YOU Irreplaceable** — Purpose vs Task mindset; understanding what AI can and cannot replace
2. **Navigate AI Uncertainty** — VUCA world, AI media literacy, decision-making under uncertainty
3. **Practical AI Skills** — Good vs bad AI usage, prompt engineering, AI ethics

Each module includes AI-generated video scripts, infographics, real-world scenarios, and a personalized quiz. Content is tailored based on an onboarding questionnaire that profiles each student's background, fears, and goals.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Flask (Python), flask-cors |
| Text AI | Local llama.cpp (fine-tuned Llama 3.2 3B) or IBM watsonx.ai (Llama 3.3 70B) |
| Image AI | HuggingFace Inference API (SDXL) |
| Fine-Tuning | Custom LoRA on SDXL via Google Colab (T4 GPU) |
| Fonts | Space Grotesk (headings), Inter (body) via Google Fonts |
| Icons | Lucide React |

## Project Structure

```
calgaryhacks2026/
├── src/                        # React frontend
│   ├── pages/                  # Route pages (Landing, SignUp, Onboarding, Dashboard, Module, Quiz)
│   ├── components/
│   │   ├── dashboard/          # Dashboard, ModuleCard, ProfileSummary, WelcomeMessage
│   │   ├── modules/            # ModulePage, ContentSection, QuizFlow
│   │   ├── onboarding/         # OnboardingFlow, QuestionCard, ProgressDots
│   │   ├── ui/                 # Reusable UI components (Button, Card, Badge, etc.)
│   │   └── common/             # Shared components
│   ├── services/               # AI stubs, localStorage, profile analyzer
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Constants, prompt templates
├── server/                     # Flask backend
│   ├── app.py                  # API endpoints (welcome, module-content, quiz, generate-image)
│   └── requirements.txt        # Python dependencies
├── training/                   # Model fine-tuning
│   ├── colab_finetune.py       # Google Colab training script (Llama 3.2 3B QLoRA)
│   └── training_data.jsonl     # Training data
├── outputs/                    # Generated model weights (git-ignored)
├── index.html                  # Entry point
├── vite.config.ts              # Vite configuration
├── package.json                # Node dependencies
└── tsconfig.json               # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- (Optional) A HuggingFace API token for image generation
- (Optional) IBM watsonx.ai credentials or a local GGUF model file

### Frontend

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Backend

```bash
cd server
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
# Choose 'local' or 'watsonx'
AI_MODE=watsonx

# For local mode — path to your GGUF model
MODEL_PATH=./model.gguf

# For watsonx mode
IBM_API_KEY=your_ibm_api_key
IBM_PROJECT_ID=your_project_id

# For image generation
HF_TOKEN=your_huggingface_token
```

Start the server:

```bash
python server/app.py
```

Runs on `http://localhost:5001`.

### Fine-Tuning (Google Colab)

The text model is fine-tuned using QLoRA on a free T4 GPU:

1. Open Google Colab and create a new notebook
2. Set runtime to **T4 GPU**
3. Copy the contents of `training/colab_finetune.py` into cells and run
4. Training takes ~25-35 minutes
5. Downloads the fine-tuned GGUF model when complete

The image model uses a custom SDXL LoRA, trained separately and hosted on HuggingFace at `bilalahmed927/Claire`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/welcome` | Personalized welcome message |
| POST | `/api/module-content` | AI-generated module content (video script, infographic, scenario, takeaways) |
| POST | `/api/quiz` | 5 personalized multiple-choice quiz questions |
| POST | `/api/generate-image` | Educational image generation via SDXL |
| GET | `/api/health` | Server status and configuration |

## How Personalization Works

During onboarding, students answer questions about their:
- Field of study and year
- Career aspirations
- Comfort level with AI
- Biggest concerns about AI
- Preferred learning format
- AI dependency level

This builds a student profile that shapes every piece of content — module text, quiz questions, scenarios, and images are all tailored to the individual student.

## Team

Bilal Ahmed, Haris Naveed, Shayan Shaikh, Amr Taha, Bilal Ahmed (x2).
