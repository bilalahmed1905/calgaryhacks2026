// ============================================
// AI Prompt Templates — STUBS
// TODO: Replace with your model's prompt format
// ============================================

import type { UserProfile } from "../types";

/**
 * Generate a prompt for module content.
 * This is a STUB — adapt for your model's format.
 */
export function buildModulePrompt(
  moduleId: string,
  profile: UserProfile
): string {
  const { field, year, career, learningFormat, dependencyLevel, primaryFear } =
    profile;

  const modulePrompts: Record<string, string> = {
    module1: `Generate educational content for a ${year} year ${field} student interested in ${career}.
Their learning style is ${learningFormat}. Their AI dependency is ${dependencyLevel}.
Their biggest career fear is ${primaryFear}.

Topic: What Makes YOU Irreplaceable in ${field}

Generate the following sections:
1. A short video script (300 words) explaining purpose vs task mindset in ${field}
2. An infographic description: 'Skills AI Can't Replace in ${field}' (list 6 items with icons)
3. A scenario exercise relevant to ${career}
4. Key takeaways (4-5 bullet points)

Format: Return as JSON with sections array.`,

    module2: `Generate educational content for a ${year} year ${field} student interested in ${career}.
Their learning style is ${learningFormat}. Their biggest fear is ${primaryFear}.

Topic: Navigate AI Uncertainty & VUCA World for ${field}

Generate the following sections:
1. "Your Industry in 2030: What Changes, What Stays Human" (300 words)
2. Media literacy infographic: "How to Spot AI-Generated Misinformation" (6 items)
3. "Decision-Making Under Uncertainty" scenario for ${career}
4. Key takeaways (4-5 bullet points)

Format: Return as JSON with sections array.`,

    module3: `Generate educational content for a ${year} year ${field} student interested in ${career}.
Their learning style is ${learningFormat}. Their AI usage level is ${dependencyLevel}.

Topic: Develop Practical AI Skills for ${field}

Generate the following sections:
1. "Good vs Bad AI Usage in ${field}" tutorial (300 words)
2. "Prompt Engineering for ${field}" with side-by-side comparisons (6 pairs)
3. "AI Ethics in Practice" scenario for ${career}
4. Key takeaways (4-5 bullet points)

Format: Return as JSON with sections array.`,
  };

  return modulePrompts[moduleId] ?? modulePrompts.module1;
}

/**
 * Generate a prompt for quiz questions.
 * STUB — adapt for your model.
 */
export function buildQuizPrompt(
  moduleId: string,
  profile: UserProfile
): string {
  return `Generate 5-8 multiple choice quiz questions for a ${profile.year} year ${profile.field} student.
Module: ${moduleId}
Difficulty: adjusted for ${profile.dependencyLevel} AI usage
Each question should have 4 options, a correct answer index, and a brief explanation.
Return as JSON array.`;
}

/**
 * Generate a prompt for welcome message.
 * STUB — adapt for your model.
 */
export function buildWelcomePrompt(
  userName: string,
  profile: UserProfile
): string {
  return `Generate a warm, personalized welcome message for ${userName}.
Profile: ${profile.label}
Year: ${profile.year}, Field: ${profile.field}, Career interest: ${profile.career}
Tone: ${profile.tonePreference}
Keep it 2-3 sentences. Be encouraging but not cheesy.`;
}
