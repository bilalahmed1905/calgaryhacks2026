// ============================================
// AI Service — STUBS ONLY
// This is where your own model integration goes.
// All functions return placeholder data for now.
// Replace the implementations with your model calls.
// ============================================

import type {
  UserProfile,
  ModuleContent,
  QuizQuestion,
} from "../types";

/**
 * Generate a personalized welcome message for the dashboard.
 * TODO: Replace with your own AI model call.
 */
export async function generateWelcomeMessage(
  userName: string,
  profile: UserProfile
): Promise<string> {
  // STUB — replace with your model
  await _simulateDelay();
  return `Hi ${userName}, based on your responses, you're a ${profile.label}. Here's your personalized path to clarity — we've crafted each module specifically for a ${profile.year} year ${profile.field} student like you.`;
}

/**
 * Generate all content for a specific module.
 * TODO: Replace with your own AI model call.
 */
export async function generateModuleContent(
  moduleId: string,
  profile: UserProfile
): Promise<ModuleContent> {
  // STUB — replace with your model
  await _simulateDelay();
  return _getPlaceholderContent(moduleId, profile);
}

/**
 * Generate quiz questions for a specific module.
 * TODO: Replace with your own AI model call.
 */
export async function generateQuizQuestions(
  moduleId: string,
  profile: UserProfile
): Promise<QuizQuestion[]> {
  // STUB — replace with your model
  await _simulateDelay();
  return _getPlaceholderQuiz(moduleId, profile);
}

// ---- Internal helpers ----

function _simulateDelay(ms = 1500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function _getPlaceholderContent(
  moduleId: string,
  profile: UserProfile
): ModuleContent {
  const field = profile.field;
  const career = profile.career;

  const contentMap: Record<string, ModuleContent> = {
    module1: {
      sections: [
        {
          type: "video",
          title: `What Makes YOU Irreplaceable in ${field}`,
          content: `### The Purpose vs Task Mindset\n\nIn the age of AI, the difference between thriving and being replaced comes down to one thing: **purpose over task**.\n\nAI excels at tasks — data entry, code generation, report formatting. But it cannot replicate **your unique perspective**, your ability to ask "why," or your capacity to connect ideas across domains.\n\nAs a ${field} student pursuing ${career}, your irreplaceable value lies not in *what* you produce, but in *why* and *how* you think about problems.\n\n**The key insight:** Every professional task has two layers:\n1. **The task layer** — what gets done (automatable)\n2. **The purpose layer** — why it matters, who it serves, what it means (uniquely human)\n\nYour goal isn't to compete with AI at tasks. It's to operate at the purpose layer where AI can't follow.`,
        },
        {
          type: "infographic",
          title: `Skills AI Can't Replace in ${field}`,
          content: `These are the uniquely human capabilities that will define success in ${field}:`,
          items: [
            "🎯 Strategic Thinking — Seeing the big picture and defining meaningful goals",
            "🤝 Empathetic Communication — Understanding stakeholder needs and emotions",
            "🔍 Critical Judgment — Evaluating AI outputs and making ethical decisions",
            "💡 Creative Problem-Solving — Novel approaches to unprecedented challenges",
            "🌐 Cross-Domain Synthesis — Connecting disparate ideas and disciplines",
            "🧭 Ethical Reasoning — Navigating moral complexities AI cannot weigh",
          ],
        },
        {
          type: "scenario",
          title: "Apply It: Purpose vs Task in Action",
          content: `### Scenario\n\nYou're working on a ${career}-related project. Your team needs to analyze user feedback data and present recommendations.\n\n**The Task Approach:** Feed all feedback into AI, let it generate a summary and recommendations, copy-paste into slides.\n\n**The Purpose Approach:** Use AI to organize and categorize the feedback. Then *you* identify the deeper patterns — what are users *really* struggling with? What does this mean for the product's direction? You craft recommendations that reflect your understanding of the users as people, not just data points.\n\n**The Difference:** The task approach delivers faster. The purpose approach delivers *better* — and it's the approach that gets you promoted, trusted, and valued.`,
        },
        {
          type: "takeaways",
          title: "Key Takeaways",
          content: "What to remember from this module:",
          items: [
            "AI replaces tasks, not purpose — focus on the 'why' behind your work",
            `Your ${field} degree gives you domain expertise that AI supplements, not replaces`,
            "The most valuable professionals operate at the purpose layer",
            "Practice asking 'What does this mean?' after every AI-generated output",
            "Build skills that require judgment, empathy, and ethical reasoning",
          ],
        },
      ],
      generatedAt: new Date().toISOString(),
    },
    module2: {
      sections: [
        {
          type: "video",
          title: `Your Industry in 2030: What Changes, What Stays Human`,
          content: `### Navigating Uncertainty in ${field}\n\nThe world is changing faster than any generation before has experienced. This is what experts call a **VUCA world** — Volatile, Uncertain, Complex, and Ambiguous.\n\nFor ${field} professionals, this means:\n- **Volatile:** Job descriptions are rewritten every 2-3 years\n- **Uncertain:** New tools and platforms emerge constantly\n- **Complex:** Problems span multiple disciplines\n- **Ambiguous:** There's rarely one "right" answer\n\n**But here's the good news:** Uncertainty creates opportunity for those who know how to navigate it. The students who thrive aren't the ones who predict the future perfectly — they're the ones who build **adaptive skills** that work in any future.\n\n### What Changes\n- Routine analysis and reporting will be AI-assisted\n- Entry-level task work will shrink\n- Remote and async collaboration will grow\n\n### What Stays Human\n- Client relationships and trust-building\n- Ethical decision-making in grey areas\n- Creative strategy and vision-setting\n- Cross-cultural communication and empathy`,
        },
        {
          type: "infographic",
          title: "How to Spot AI-Generated Misinformation",
          content: "Critical media literacy skills for the AI age:",
          items: [
            "🔍 Check the source — AI-generated content often lacks verifiable attribution",
            "📊 Verify statistics — AI confidently fabricates numbers; always cross-reference",
            "🧠 Trust your domain expertise — if something sounds off in your field, investigate",
            "📝 Look for hallmarks — repetitive phrasing, generic examples, lack of nuance",
            "🔗 Follow the citations — AI may cite papers or links that don't exist",
            "⚖️ Consider the incentive — who benefits from this content being believed?",
          ],
        },
        {
          type: "scenario",
          title: "Decision-Making Under Uncertainty",
          content: `### Scenario\n\nYou're graduating in a year. A new AI tool has just automated a significant part of what ${career} professionals do. Social media is full of "your career is dead" takes.\n\n**How do you respond?**\n\n**Reactive approach:** Panic. Switch majors. Follow the hype to whatever field seems "AI-proof" today.\n\n**Adaptive approach:** \n1. **Assess** — What specifically did AI automate? The task layer or the purpose layer?\n2. **Adapt** — How can you integrate this tool to become *more* valuable?\n3. **Advance** — What new opportunities does this create that didn't exist before?\n\nHistorically, every major technology shift (spreadsheets, internet, mobile) eliminated some jobs while creating far more. The professionals who thrived were the ones who learned to work *with* the new tool, not against it.`,
        },
        {
          type: "takeaways",
          title: "Key Takeaways",
          content: "What to remember from this module:",
          items: [
            "Uncertainty is normal — build adaptive skills, not just technical ones",
            "AI media literacy is a critical skill: verify, question, and think critically",
            "Career planning should be directional, not precise — aim for a zone, not a point",
            "The VUCA framework helps you name and navigate different types of uncertainty",
            "Those who adapt to new tools first gain the biggest advantage",
          ],
        },
      ],
      generatedAt: new Date().toISOString(),
    },
    module3: {
      sections: [
        {
          type: "video",
          title: `Good vs Bad: AI Usage in ${field}`,
          content: `### Practical AI Skills for ${field}\n\nAI is a powerful tool — but like any tool, the value depends on **how** you use it.\n\n**Bad AI Usage (The Crutch Pattern):**\n- Copying AI outputs without understanding them\n- Using AI to skip learning fundamentals\n- Trusting AI outputs without verification\n- Losing your own analytical skills over time\n\n**Good AI Usage (The Tool Pattern):**\n- Using AI to accelerate work you already understand\n- Treating AI as a first draft, not a final answer\n- Verifying outputs against your domain knowledge\n- Using AI to explore more possibilities, not fewer\n\n### Prompt Engineering for ${field}\n\nThe difference between a useless AI response and a brilliant one is the **prompt**.\n\n**Weak prompt:** "Write a report on market trends"\n**Strong prompt:** "Act as a ${career} analyst. Analyze Q3 2025 market trends in [specific sector]. Focus on consumer behavior shifts driven by AI adoption. Include 3 data-backed recommendations. Format as executive summary with bullet points."\n\nThe key principles:\n1. **Context** — Tell AI who you are and what you need\n2. **Specificity** — Be precise about scope, format, and depth\n3. **Constraints** — Set boundaries (word count, tone, audience)\n4. **Iteration** — Refine prompts based on outputs`,
        },
        {
          type: "infographic",
          title: "Effective vs Ineffective AI Prompts",
          content: `Side-by-side comparison for ${field} professionals:`,
          items: [
            "❌ 'Summarize this article' → ✅ 'Summarize this article's key arguments, noting any unsupported claims, in 200 words for a technical audience'",
            "❌ 'Write my essay' → ✅ 'Help me outline an argument for [thesis]. I'll write the essay myself using this structure'",
            "❌ 'Solve this problem' → ✅ 'Walk me through the approach to solve this. Don't give the answer — help me understand the method'",
            "❌ 'Is this good?' → ✅ 'Evaluate this against [specific criteria]. What are the 3 strongest and 3 weakest aspects?'",
            "❌ 'Generate data' → ✅ 'Help me identify what data sources would answer [specific question] and how to analyze them'",
            "❌ 'Do my research' → ✅ 'I've read [X, Y, Z]. What perspectives am I missing? Suggest 3 counterarguments to my thesis'",
          ],
        },
        {
          type: "scenario",
          title: "AI Ethics in Practice",
          content: `### Scenario\n\nYou're using AI to help with a ${career}-related project. The AI generates impressive results, but you notice:\n1. Some of the "facts" can't be verified\n2. The output closely mirrors an existing published work\n3. Your professor/employer hasn't set clear AI usage policies\n\n**What's the ethical approach?**\n\n1. **Transparency** — Disclose your AI usage. Saying "I used AI to help research and structure this" is professional, not weak.\n2. **Verification** — Every fact, statistic, and claim must be independently verified. AI hallucinates.\n3. **Attribution** — If AI helped generate ideas, note it. If the output mirrors existing work, cite the original.\n4. **Value-Add** — Ask yourself: "What did *I* contribute beyond prompting AI?" If the answer is "nothing," you haven't done the work.\n\n**The golden rule:** Use AI in a way you'd be comfortable explaining to your professor, employer, or client.`,
        },
        {
          type: "takeaways",
          title: "Key Takeaways",
          content: "What to remember from this module:",
          items: [
            "AI is a tool, not a crutch — use it to enhance your capabilities, not replace them",
            "Good prompts are specific, contextual, and constrained",
            "Always verify AI outputs against your domain knowledge",
            "Ethical AI usage requires transparency, verification, and genuine value-add",
            "The best AI users are those who understand their field deeply first",
          ],
        },
      ],
      generatedAt: new Date().toISOString(),
    },
  };

  return contentMap[moduleId] ?? contentMap.module1;
}

function _getPlaceholderQuiz(
  moduleId: string,
  _profile: UserProfile
): QuizQuestion[] {
  const quizMap: Record<string, QuizQuestion[]> = {
    module1: [
      {
        id: 1,
        question:
          "What is the key difference between the 'task layer' and the 'purpose layer' of professional work?",
        options: [
          "Tasks are harder than purpose",
          "Tasks are what gets done (automatable); purpose is why it matters (uniquely human)",
          "Purpose is about making money; tasks are about learning",
          "There is no meaningful difference",
        ],
        correctIndex: 1,
        explanation:
          "The task layer (what gets done) is increasingly automatable by AI, while the purpose layer (why it matters, who it serves) requires uniquely human judgment and empathy.",
      },
      {
        id: 2,
        question: "Which of these is a skill AI CANNOT effectively replace?",
        options: [
          "Data entry and formatting",
          "Pattern recognition in large datasets",
          "Ethical reasoning in ambiguous situations",
          "Code syntax checking",
        ],
        correctIndex: 2,
        explanation:
          "Ethical reasoning requires understanding human values, cultural context, and moral nuance — capabilities that remain uniquely human.",
      },
      {
        id: 3,
        question:
          "In the purpose vs task framework, what should you do AFTER an AI generates output?",
        options: [
          "Submit it immediately to save time",
          "Ask 'What does this mean?' and add your own interpretation",
          "Generate three more versions and pick the best",
          "Delete it and start from scratch",
        ],
        correctIndex: 1,
        explanation:
          "The purpose-driven approach means using AI outputs as starting points, then adding your unique interpretation, judgment, and domain expertise.",
      },
      {
        id: 4,
        question: "Why is cross-domain synthesis considered irreplaceable by AI?",
        options: [
          "AI can't process information from multiple sources",
          "AI lacks the ability to read academic papers",
          "Connecting disparate ideas requires creative leaps and contextual understanding AI lacks",
          "It's actually easily replaceable by AI",
        ],
        correctIndex: 2,
        explanation:
          "While AI can combine information, the creative insight of connecting concepts across unrelated domains in meaningful ways requires human intuition and experience.",
      },
      {
        id: 5,
        question:
          "A colleague says 'AI will make our degrees worthless.' What's the best purpose-driven response?",
        options: [
          "They're right — we should all switch to AI engineering",
          "AI changes how we work, but domain expertise + purpose-layer skills become more valuable, not less",
          "AI is just a fad and will go away",
          "We should refuse to use AI to protect our jobs",
        ],
        correctIndex: 1,
        explanation:
          "Degrees provide domain expertise and critical thinking frameworks. AI changes the task layer but makes purpose-layer skills (judgment, strategy, ethics) more valuable.",
      },
    ],
    module2: [
      {
        id: 1,
        question: "What does VUCA stand for?",
        options: [
          "Virtual, Universal, Creative, Adaptive",
          "Volatile, Uncertain, Complex, Ambiguous",
          "Variable, Unpredictable, Changing, Automated",
          "Visionary, Unified, Collaborative, Agile",
        ],
        correctIndex: 1,
        explanation:
          "VUCA stands for Volatile, Uncertain, Complex, and Ambiguous — a framework for understanding the modern professional landscape.",
      },
      {
        id: 2,
        question: "What is the BEST approach when a new AI tool automates part of your field?",
        options: [
          "Immediately switch to a different career path",
          "Ignore it and hope it goes away",
          "Assess what's automated, adapt your skills, and advance into new opportunities",
          "Post about it on social media",
        ],
        correctIndex: 2,
        explanation:
          "The adaptive approach (Assess → Adapt → Advance) helps you respond strategically rather than reactively to technological change.",
      },
      {
        id: 3,
        question: "How can you identify potentially AI-generated misinformation?",
        options: [
          "If it's on the internet, it's always true",
          "Check sources, verify statistics, follow citations, and use your domain expertise",
          "AI never generates false information",
          "Only trust information from social media",
        ],
        correctIndex: 1,
        explanation:
          "Critical media literacy — checking sources, verifying data, following citations, and applying domain knowledge — is essential for navigating AI-generated content.",
      },
      {
        id: 4,
        question: "Why should career planning be 'directional, not precise'?",
        options: [
          "Because being precise is too much work",
          "Because the job market changes too fast for exact predictions — aim for a zone of adaptable skills",
          "Because it doesn't matter what career you choose",
          "Because AI will choose your career for you",
        ],
        correctIndex: 1,
        explanation:
          "In a VUCA world, rigid career plans break easily. Building adaptable skills in a general direction lets you pivot as opportunities emerge.",
      },
      {
        id: 5,
        question: "Historically, what happens when major technology shifts occur?",
        options: [
          "All existing jobs disappear permanently",
          "Nothing changes at all",
          "Some jobs are eliminated while far more new ones are created",
          "Technology shifts only affect blue-collar workers",
        ],
        correctIndex: 2,
        explanation:
          "Every major shift (spreadsheets, internet, mobile) eliminated some jobs while creating many more. Those who adapted first gained the biggest advantage.",
      },
    ],
    module3: [
      {
        id: 1,
        question: "What defines 'bad' AI usage (the crutch pattern)?",
        options: [
          "Using AI for brainstorming ideas",
          "Copying AI outputs without understanding them and skipping fundamentals",
          "Using AI to check your work",
          "Asking AI to explain complex concepts",
        ],
        correctIndex: 1,
        explanation:
          "The crutch pattern means depending on AI to skip learning and understanding — copying without comprehension erodes your own capabilities over time.",
      },
      {
        id: 2,
        question: "What makes a strong AI prompt?",
        options: [
          "Being as vague as possible to give AI creative freedom",
          "Writing as little as possible",
          "Including context, specificity, and constraints",
          "Using only single-word commands",
        ],
        correctIndex: 2,
        explanation:
          "Strong prompts include context (who you are), specificity (what exactly you need), and constraints (format, length, audience) to get useful outputs.",
      },
      {
        id: 3,
        question: "What should you do when AI generates facts you can't verify?",
        options: [
          "Trust them — AI is very accurate",
          "Independently verify them using reliable sources before using them",
          "Ignore the facts and only use opinions",
          "Ask a different AI to confirm",
        ],
        correctIndex: 1,
        explanation:
          "AI hallucination is real — always verify facts, statistics, and citations against reliable, independent sources.",
      },
      {
        id: 4,
        question: "What is the 'golden rule' of ethical AI usage?",
        options: [
          "Never tell anyone you used AI",
          "Use AI for everything possible",
          "Use AI in a way you'd be comfortable explaining to your professor, employer, or client",
          "Only use AI for personal projects",
        ],
        correctIndex: 2,
        explanation:
          "Transparency is key. If you'd be uncomfortable explaining how you used AI, you're probably not using it ethically.",
      },
      {
        id: 5,
        question: "What question should you ask yourself to ensure you're adding value beyond AI?",
        options: [
          "'Did I finish faster than without AI?'",
          "'What did I contribute beyond prompting AI?'",
          "'Did anyone notice I used AI?'",
          "'Is the output longer than what I'd write?'",
        ],
        correctIndex: 1,
        explanation:
          "If your only contribution was writing a prompt, you haven't done the work. Your value-add should include interpretation, judgment, and domain expertise.",
      },
    ],
  };

  return quizMap[moduleId] ?? quizMap.module1;
}
