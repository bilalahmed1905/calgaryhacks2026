// ============================================
// TypeScript interfaces for the entire app
// ============================================

export interface User {
  name: string;
  email: string;
  createdAt: string;
}

export type Major =
  | "Computer Science"
  | "Business"
  | "Engineering"
  | "Arts"
  | "Science"
  | "Health Sciences"
  | "Education"
  | "Law"
  | "Other";

export type Year = "1st" | "2nd" | "3rd" | "4th" | "Graduate";

export type AIUsageLevel = "A" | "B" | "C" | "D";
export type BiggestFear = "A" | "B" | "C" | "D" | "E";
export type LearningStyle = "A" | "B" | "C" | "D";
export type MindsetType = "A" | "B" | "C" | "D";

export interface OnboardingAnswers {
  q1_major: Major;
  q1_year: Year;
  q1_career: string;
  q2_ai_usage: AIUsageLevel;
  q3_biggest_fear: BiggestFear;
  q3_other_text?: string;
  q4_learning_style: LearningStyle;
  q5_mindset: MindsetType;
  completedAt: string;
}

export type DependencyLevel = "low" | "moderate" | "high" | "very_high";
export type MindsetProfile = "task_oriented" | "balanced" | "purpose_driven" | "independent";
export type PrimaryFear =
  | "ai_relevance"
  | "unknown_jobs"
  | "lacking_skills"
  | "too_many_choices"
  | "other";
export type LearningFormat = "hands_on" | "visual" | "step_by_step" | "summaries";
export type TonePreference = "reassuring" | "balanced" | "challenging";

export interface UserProfile {
  label: string;
  dependencyLevel: DependencyLevel;
  mindsetType: MindsetProfile;
  primaryFear: PrimaryFear;
  learningFormat: LearningFormat;
  recommendedStartModule: number;
  tonePreference: TonePreference;
  field: string;
  year: Year;
  career: string;
}

export type ModuleStatus = "locked" | "available" | "in_progress" | "completed";

export interface ModuleContentSection {
  type: "video" | "infographic" | "scenario" | "takeaways";
  title: string;
  content: string; // Markdown or structured text
  items?: string[]; // For lists (takeaways, infographic items)
  imageUrl?: string; // AI-generated image from Stable Diffusion
}

export interface ModuleContent {
  sections: ModuleContentSection[];
  generatedAt: string;
}

export interface ModuleState {
  status: ModuleStatus;
  content: ModuleContent | null;
  generatedAt: string | null;
}

export interface ModulesData {
  module1: ModuleState;
  module2: ModuleState;
  module3: ModuleState;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
  answers: number[];
  score: number;
  completedAt: string;
}

export interface QuizzesData {
  module1?: QuizResult;
  module2?: QuizResult;
  module3?: QuizResult;
}
