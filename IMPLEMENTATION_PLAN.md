# ClarityPath — Implementation Plan

## Understanding

is a **structured, personalized learning platform** (NOT a chatbot) that guides students through a journey:

**Sign Up → 5 Onboarding Questions → Personalized Dashboard → 3 Learning Modules (each with content + quiz)**

All content is AI-generated based on the user's onboarding profile. Data lives in **localStorage** — no backend/database.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build Tool | **Vite** (React + TypeScript) |
| UI Framework | **React 18** with React Router |
| Styling | **Tailwind CSS** + custom design tokens |
| AI Content Generation | **OpenAI API** (or Claude API) called client-side or via a thin serverless function | Only make a section for us to add this in this is a our own model DO NOT do this part just add stubs so we can do it later
| Data Persistence | **localStorage** (user profile, progress, generated content cache) |
| Animations | **Framer Motion** (lightweight, good for transitions between steps) |
| Charts/Visuals | **Recharts** or simple SVG components for infographics |
| Icons | **Lucide React** |
| Markdown Rendering | **react-markdown** (for AI-generated educational content) |

---

## Project Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router setup
├── index.css                   # Tailwind directives + global styles
│
├── components/
│   ├── ui/                     # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── Dropdown.tsx
│   │   ├── TextInput.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   │
│   ├── layout/
│   │   ├── AppShell.tsx        # Sidebar + top bar wrapper
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   │
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx  # Step wizard container
│   │   ├── QuestionCard.tsx    # Renders a single question step
│   │   ├── ProgressDots.tsx    # 5-dot progress indicator
│   │   └── questions.ts       # Static question definitions (text, options, IDs)
│   │
│   ├── dashboard/
│   │   ├── Dashboard.tsx       # Main dashboard page
│   │   ├── ProfileSummary.tsx  # "Purpose-Driven CS Major with Moderate AI Use"
│   │   ├── ModuleCard.tsx      # Card for each of the 3 modules
│   │   └── WelcomeMessage.tsx  # AI-generated personalized welcome
│   │
│   ├── modules/
│   │   ├── ModulePage.tsx      # Generic module page (loads content by module ID)
│   │   ├── ContentSection.tsx  # Renders a video/infographic/text section
│   │   ├── InfographicCard.tsx # Visual diagram component
│   │   ├── VideoPlayer.tsx     # Simulated video (text + images + narration style)
│   │   └── QuizFlow.tsx        # 5-8 question quiz at end of each module
│   │
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── AIGeneratingState.tsx # "Generating your personalized content..." animation
│       └── ErrorBoundary.tsx
│
├── pages/
│   ├── LandingPage.tsx         # Marketing/signup page
│   ├── SignUpPage.tsx          # Name + email (stored in localStorage)
│   ├── OnboardingPage.tsx      # Hosts OnboardingFlow
│   ├── DashboardPage.tsx       # Hosts Dashboard
│   ├── ModuleViewPage.tsx      # Hosts ModulePage (route: /module/:id)
│   └── QuizPage.tsx            # Hosts QuizFlow (route: /module/:id/quiz)
│
├── services/
│   ├── ai.ts                   # AI API calls (generate content, generate quiz, analyze profile)
│   ├── storage.ts              # localStorage wrapper (get/set/clear user data)
│   └── profileAnalyzer.ts     # Takes onboarding answers → produces user profile object
│
├── hooks/
│   ├── useUserProfile.ts       # Read/write user profile from localStorage
│   ├── useModuleContent.ts     # Fetch or cache AI-generated module content
│   ├── useQuiz.ts              # Quiz state management (current question, score, etc.)
│   └── useOnboarding.ts        # Onboarding step state
│
├── types/
│   └── index.ts                # TypeScript interfaces (UserProfile, Module, QuizQuestion, etc.)
│
├── utils/
│   ├── prompts.ts              # AI prompt templates for each content type
│   └── constants.ts            # App-wide constants (module IDs, question IDs, etc.)
│
└── assets/
    ├── logo.svg
    └── illustrations/          # Static fallback images
```

---

## Data Model (localStorage)

### `claritypath_user`
```json
{
  "name": "Bilal",
  "email": "bilal@example.com",
  "createdAt": "2026-02-14T..."
}
```

### `claritypath_onboarding`
```json
{
  "q1_major": "Computer Science",
  "q1_year": "3rd",
  "q1_career": "Software Engineering / AI Research",
  "q2_ai_usage": "C",
  "q3_biggest_fear": "A",
  "q4_learning_style": "A",
  "q5_mindset": "B",
  "completedAt": "2026-02-14T..."
}
```

### `claritypath_profile` (derived by `profileAnalyzer.ts`)
```json
{
  "label": "Purpose-Driven CS Major with Heavy AI Use",
  "dependencyLevel": "high",
  "mindsetType": "balanced",
  "primaryFear": "ai_relevance",
  "learningFormat": "hands_on",
  "recommendedStartModule": 2,
  "tonePreference": "reassuring",
  "field": "Computer Science"
}
```

### `claritypath_modules`
```json
{
  "module1": {
    "status": "locked" | "available" | "in_progress" | "completed",
    "content": { /* AI-generated content cached here */ },
    "generatedAt": "2026-02-14T..."
  },
  "module2": { ... },
  "module3": { ... }
}
```

### `claritypath_quizzes`
```json
{
  "module1": {
    "questions": [ /* AI-generated questions cached */ ],
    "answers": [0, 2, 1, 3, 1],
    "score": 4,
    "completedAt": "2026-02-14T..."
  }
}
```

---

## Page Flow & Routes

| Route | Page | Guard |
|-------|------|-------|
| `/` | Landing Page | Redirect to `/dashboard` if user exists |
| `/signup` | Sign Up (name/email) | Redirect if already signed up |
| `/onboarding` | 5-Question Flow | Requires signup, redirect if already completed |
| `/dashboard` | Personalized Dashboard | Requires onboarding complete |
| `/module/:id` | Module Content (1, 2, or 3) | Requires onboarding complete |
| `/module/:id/quiz` | Module Quiz | Requires module content viewed |

---

## AI Integration Strategy

### When AI is Called
1. **After onboarding completes** → Generate user profile summary + welcome message
2. **When a module is opened for the first time** → Generate all content for that module
3. **When quiz is started** → Generate 5-8 quiz questions for that module

### Prompt Architecture (`utils/prompts.ts`)

Each prompt template injects the user profile:

```
Module 1 Content Prompt:
"Generate educational content for a {year} year {major} student interested in {career}.
Their learning style is {learningFormat}. Their AI dependency is {dependencyLevel}.
Their biggest career fear is {primaryFear}.

Topic: What Makes YOU Irreplaceable in {major}

Generate the following sections:
1. A short video script (300 words) explaining purpose vs task mindset in {major}
2. An infographic description: 'Skills AI Can't Replace in {field}' (list 6 items with icons)
3. A scenario exercise relevant to {career}
4. Key takeaways (4-5 bullet points)

Format: Return as JSON with sections array."
```

### AI Response Caching
- Generated content is cached in localStorage under `claritypath_modules`
- Content is only regenerated if the user resets their profile
- This avoids redundant API calls and ensures fast revisits

### API Key Handling (Hackathon Scope)
- Store API key in `.env` file (`VITE_OPENAI_API_KEY`)
- Call OpenAI directly from client (acceptable for hackathon demo)
- For production: would move to edge function / serverless proxy

---

## UI/UX Plan

### Design System
Make the pages very user friendly simple non distracting and make them look like theres effort put into them, like its not just some vibe coded app
- **Colors**: Use Red and Yellow nice variants similar to University of Calgarys Color Sceheme
- **Typography**: Inter (body), Space Grotesk (headings)
- **Border radius**: Rounded-xl for cards, rounded-full for buttons
- **Tone**: Clean, modern, confidence-inspiring (not corporate, not childish)

### Landing Page
- Hero: "Your AI-Powered Career Clarity Journey" DONT USE THE NAME clarity path yet just make a name variable that we can change anytime
- Competitor comparison table (from the attached image)
- CTA: "Start Your Journey — Free"

### Onboarding Flow
- Full-screen, one question at a time
- Animated transitions between questions (slide or fade)
- Progress dots at top (1-5)
- Each question has a brief "why we ask this" tooltip
- Final step: loading animation → "Building your personalized path..."

### Dashboard
- Left: Profile summary card (label, key traits, avatar placeholder)
- Center: 3 module cards in vertical stack, each showing:
  - Module title
  - Why it's recommended for them
  - Status badge (recommended start, locked, in progress, completed)
  - Progress bar
- Top: Personalized welcome message

### Module Pages
- Vertical scroll layout with distinct sections:
  - **Video Section**: Styled text card with play icon (simulated video — rich formatted text with images)
  - **Infographic Section**: Visually styled cards/diagrams
  - **Scenario Section**: Interactive choose-your-path style
  - **Key Takeaways**: Summary bullets
- Bottom CTA: "Take the Quiz" button

### Quiz Flow
- One question at a time, full-width card
- 4 options (A-D), click to select
- After answering: show correct/incorrect with brief explanation
- End screen: score + "What you learned" summary
- Unlocks next module

---

## Implementation Phases (Hackathon Execution Order)

### Phase 1: Project Scaffolding 
- [ ] `npm create vite@latest claritypath -- --template react-ts`
- [ ] Install dependencies: `tailwindcss`, `react-router-dom`, `framer-motion`, `lucide-react`, `react-markdown`, `openai`
- [ ] Configure Tailwind + design tokens
- [ ] Set up folder structure
- [ ] Set up React Router with all routes
- [ ] Build localStorage service (`storage.ts`)

### Phase 2: Onboarding Flow 
- [ ] Build reusable `QuestionCard` component
- [ ] Define all 5 questions in `questions.ts`
- [ ] Build `OnboardingFlow` wizard with step navigation
- [ ] Build `profileAnalyzer.ts` (deterministic logic: answers → profile)
- [ ] Add transitions/animations between steps
- [ ] Loading state: "Generating your path..."

### Phase 3: Dashboard 
- [ ] Build `ProfileSummary` component
- [ ] Build `ModuleCard` component (3 cards)
- [ ] AI-generated welcome message
- [ ] Module recommendation logic (based on profile)
- [ ] Navigation to modules

### Phase 4: Module Content 
- [ ] Build AI prompt templates for all 3 modules
- [ ] Build `ModulePage` layout (sections renderer)
- [ ] Build `ContentSection`, `InfographicCard`, `VideoPlayer` components
- [ ] Integrate AI API calls + caching
- [ ] Generate sample content for Module 1 as proof-of-concept
- [ ] Style all content sections

### Phase 5: Quiz System 
- [ ] Build `QuizFlow` component
- [ ] AI-generated quiz questions based on module + profile
- [ ] Score tracking + completion state
- [ ] Results screen with feedback
- [ ] Module unlock logic after quiz completion

### Phase 6: Polish 
- [ ] Landing page with competitor table
- [ ] Responsive design pass
- [ ] Loading states and error handling
- [ ] Smooth transitions throughout
- [ ] Demo data / fallback content if API is down

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | None (localStorage) | Hackathon speed, no auth complexity |
| AI calls | Client-side OpenAI SDK | Simplest for demo; API key in env |
| Video content | Simulated (rich text + images) | actual realtime video using stable diffusion (dont do that we are doing that) |
| Module unlock | Sequential (1 → 2 → 3) or recommended-first | Recommended-first based on profile, but all accessible |
| Content caching | localStorage per module | Avoids re-generating on page refresh |
| Quiz scoring | Immediate feedback per question | Better learning experience than end-only scoring |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| AI API rate limits / slow responses | Pre-generate fallback content; cache aggressively |
| API key exposure in client | Acceptable for hackathon; note as production concern |
| Content quality varies | Use structured JSON output format; validate before rendering |
| localStorage limits (~5-10MB) | Content is text-based, well within limits |
| Time pressure | Phase 4 (Module Content) is the core — prioritize Module 1 as proof-of-concept |

---

## Dependencies to Install

```bash
npm create vite@latest . -- --template react-ts
npm install react-router-dom framer-motion lucide-react react-markdown openai
npm install -D tailwindcss @tailwindcss/vite
```

---

*This plan covers the full scope. For hackathon, the MVP is: Onboarding → Dashboard → 1 Complete Module with Quiz.*
