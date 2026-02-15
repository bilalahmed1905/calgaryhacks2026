// ============================================================
// APP NAME — Change this ONE variable to rename the entire app
// ============================================================
export const APP_NAME = "ClarityPath";

// localStorage key prefix (derived from app name)
export const STORAGE_PREFIX = "app";

// localStorage keys
export const STORAGE_KEYS = {
  USER: `${STORAGE_PREFIX}_user`,
  ONBOARDING: `${STORAGE_PREFIX}_onboarding`,
  PROFILE: `${STORAGE_PREFIX}_profile`,
  MODULES: `${STORAGE_PREFIX}_modules`,
  QUIZZES: `${STORAGE_PREFIX}_quizzes`,
} as const;

// Module IDs
export const MODULE_IDS = {
  MODULE_1: "module1",
  MODULE_2: "module2",
  MODULE_3: "module3",
} as const;

// Module metadata
export const MODULES_META = {
  [MODULE_IDS.MODULE_1]: {
    id: MODULE_IDS.MODULE_1,
    number: 1,
    title: "Build Confidence Through Skills Discovery",
    description: "Discover what makes YOU irreplaceable in your field",
    icon: "Sparkles",
  },
  [MODULE_IDS.MODULE_2]: {
    id: MODULE_IDS.MODULE_2,
    number: 2,
    title: "Navigate AI Uncertainty & VUCA World",
    description: "Learn to thrive in an uncertain, rapidly changing landscape",
    icon: "Compass",
  },
  [MODULE_IDS.MODULE_3]: {
    id: MODULE_IDS.MODULE_3,
    number: 3,
    title: "Develop Practical AI Skills",
    description: "Master practical, ethical AI usage in your discipline",
    icon: "Wrench",
  },
} as const;

// Quiz config
export const QUIZ_CONFIG = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 8,
} as const;
