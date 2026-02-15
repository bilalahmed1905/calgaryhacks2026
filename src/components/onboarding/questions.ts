// ============================================
// Onboarding question definitions
// ============================================

// Types are used by the consuming components via these question definitions

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface OnboardingQuestion {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  whyWeAsk: string;
  type: "dropdown" | "radio" | "text" | "multi-part";
  parts?: {
    id: string;
    label: string;
    type: "dropdown" | "radio" | "text";
    options?: QuestionOption[];
    placeholder?: string;
  }[];
  options?: QuestionOption[];
}

export const MAJOR_OPTIONS: QuestionOption[] = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Business", label: "Business" },
  { value: "Engineering", label: "Engineering" },
  { value: "Arts", label: "Arts" },
  { value: "Science", label: "Science" },
  { value: "Health Sciences", label: "Health Sciences" },
  { value: "Education", label: "Education" },
  { value: "Law", label: "Law" },
  { value: "Other", label: "Other" },
];

export const YEAR_OPTIONS: QuestionOption[] = [
  { value: "1st", label: "1st Year" },
  { value: "2nd", label: "2nd Year" },
  { value: "3rd", label: "3rd Year" },
  { value: "4th", label: "4th Year" },
  { value: "Graduate", label: "Graduate" },
];

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "q1",
    stepNumber: 1,
    title: "What's your current academic focus?",
    subtitle: "Tell us about your studies and career interests",
    whyWeAsk:
      "This helps us tailor examples, scenarios, and visuals specifically to your field.",
    type: "multi-part",
    parts: [
      {
        id: "q1_major",
        label: "Major / Program",
        type: "dropdown",
        options: MAJOR_OPTIONS,
      },
      {
        id: "q1_year",
        label: "What year are you in?",
        type: "dropdown",
        options: YEAR_OPTIONS,
      },
      {
        id: "q1_career",
        label: "What career path interests you most?",
        type: "text",
        placeholder: "e.g., Software Engineering, Data Science, Marketing...",
      },
    ],
  },
  {
    id: "q2",
    stepNumber: 2,
    title: "How do you currently use AI tools like ChatGPT, Copilot, or Claude?",
    subtitle: "Be honest — there are no wrong answers",
    whyWeAsk:
      "Understanding your current AI relationship helps us adjust content difficulty and messaging.",
    type: "radio",
    options: [
      {
        value: "A",
        label: "I rarely use them",
        description: "I prefer doing things myself",
      },
      {
        value: "B",
        label: "I use them occasionally",
        description: "For quick answers or brainstorming",
      },
      {
        value: "C",
        label: "I use them frequently",
        description: "For assignments and projects",
      },
      {
        value: "D",
        label: "I rely on them heavily",
        description: "I'm not sure I could work without them",
      },
    ],
  },
  {
    id: "q3",
    stepNumber: 3,
    title: "What worries you most about your career after graduation?",
    subtitle: "This shapes the tone and focus of your learning path",
    whyWeAsk:
      "Your biggest concern tells us what to prioritize and how to frame content for you.",
    type: "radio",
    options: [
      {
        value: "A",
        label: "AI making my degree irrelevant",
      },
      {
        value: "B",
        label: "Not knowing what jobs will exist",
      },
      {
        value: "C",
        label: "Lacking the right skills employers want",
      },
      {
        value: "D",
        label: "Too many choices — I don't know what path to take",
      },
      {
        value: "E",
        label: "Other",
        description: "Tell us in your own words",
      },
    ],
  },
  {
    id: "q4",
    stepNumber: 4,
    title: "How do you learn best?",
    subtitle: "This determines the balance of content formats in your modules",
    whyWeAsk:
      "We'll adjust the mix of visuals, text, and interactive scenarios to match your style.",
    type: "radio",
    options: [
      {
        value: "A",
        label: "Hands-on practice and real examples",
      },
      {
        value: "B",
        label: "Visual diagrams and infographics",
      },
      {
        value: "C",
        label: "Step-by-step explanations with context",
      },
      {
        value: "D",
        label: "Quick summaries and key takeaways",
      },
    ],
  },
  {
    id: "q5",
    stepNumber: 5,
    title:
      "You're working on a group project. AI can automate data analysis. What's your first thought?",
    subtitle: "There's no right or wrong — we want to understand your instinct",
    whyWeAsk:
      "This reveals your natural mindset toward AI, which shapes how we frame the learning journey.",
    type: "radio",
    options: [
      {
        value: "A",
        label: "Great! That saves me time",
        description: "I'll let AI handle it completely",
      },
      {
        value: "B",
        label: "I'll use AI for the basics",
        description: "Then add my own insights and interpretation",
      },
      {
        value: "C",
        label: "I want to understand the data myself first",
        description: "Then maybe use AI to check my work",
      },
      {
        value: "D",
        label: "I prefer not to use AI",
        description: "I want to prove I can do it myself",
      },
    ],
  },
];
