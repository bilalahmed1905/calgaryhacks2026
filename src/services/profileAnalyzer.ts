// ============================================
// Profile Analyzer — deterministic logic
// Maps onboarding answers → UserProfile
// ============================================

import type {
  OnboardingAnswers,
  UserProfile,
  DependencyLevel,
  MindsetProfile,
  PrimaryFear,
  LearningFormat,
  TonePreference,
} from "../types";

export function analyzeProfile(answers: OnboardingAnswers): UserProfile {
  const dependencyLevel = getDependencyLevel(answers.q2_ai_usage);
  const mindsetType = getMindsetType(answers.q5_mindset);
  const primaryFear = getPrimaryFear(answers.q3_biggest_fear);
  const learningFormat = getLearningFormat(answers.q4_learning_style);
  const tonePreference = getTonePreference(primaryFear, dependencyLevel);
  const recommendedStartModule = getRecommendedModule(primaryFear, mindsetType);
  const label = buildLabel(
    mindsetType,
    answers.q1_major,
    dependencyLevel
  );

  return {
    label,
    dependencyLevel,
    mindsetType,
    primaryFear,
    learningFormat,
    recommendedStartModule,
    tonePreference,
    field: answers.q1_major,
    year: answers.q1_year,
    career: answers.q1_career,
  };
}

function getDependencyLevel(
  aiUsage: OnboardingAnswers["q2_ai_usage"]
): DependencyLevel {
  const map: Record<string, DependencyLevel> = {
    A: "low",
    B: "moderate",
    C: "high",
    D: "very_high",
  };
  return map[aiUsage] ?? "moderate";
}

function getMindsetType(
  mindset: OnboardingAnswers["q5_mindset"]
): MindsetProfile {
  const map: Record<string, MindsetProfile> = {
    A: "task_oriented",
    B: "balanced",
    C: "purpose_driven",
    D: "independent",
  };
  return map[mindset] ?? "balanced";
}

function getPrimaryFear(
  fear: OnboardingAnswers["q3_biggest_fear"]
): PrimaryFear {
  const map: Record<string, PrimaryFear> = {
    A: "ai_relevance",
    B: "unknown_jobs",
    C: "lacking_skills",
    D: "too_many_choices",
    E: "other",
  };
  return map[fear] ?? "other";
}

function getLearningFormat(
  style: OnboardingAnswers["q4_learning_style"]
): LearningFormat {
  const map: Record<string, LearningFormat> = {
    A: "hands_on",
    B: "visual",
    C: "step_by_step",
    D: "summaries",
  };
  return map[style] ?? "hands_on";
}

function getTonePreference(
  fear: PrimaryFear,
  dependency: DependencyLevel
): TonePreference {
  // If they're very worried or heavily dependent, be reassuring
  if (fear === "ai_relevance" || dependency === "very_high") return "reassuring";
  // If they're independent and confident, challenge them
  if (dependency === "low") return "challenging";
  return "balanced";
}

function getRecommendedModule(
  fear: PrimaryFear,
  mindset: MindsetProfile
): number {
  // Worried about AI relevance or unknown jobs → Module 2 first
  if (fear === "ai_relevance" || fear === "unknown_jobs") return 2;
  // Task-oriented mindset → needs Module 1 first
  if (mindset === "task_oriented") return 1;
  // Lacking skills → Module 3 first
  if (fear === "lacking_skills") return 3;
  // Default to Module 1
  return 1;
}

function buildLabel(
  mindset: MindsetProfile,
  major: string,
  dependency: DependencyLevel
): string {
  const mindsetLabel: Record<MindsetProfile, string> = {
    task_oriented: "Task-Focused",
    balanced: "Balanced",
    purpose_driven: "Purpose-Driven",
    independent: "Self-Reliant",
  };

  const depLabel: Record<DependencyLevel, string> = {
    low: "Minimal AI Use",
    moderate: "Moderate AI Use",
    high: "Heavy AI Use",
    very_high: "AI-Dependent",
  };

  return `${mindsetLabel[mindset]} ${major} Major with ${depLabel[dependency]}`;
}
