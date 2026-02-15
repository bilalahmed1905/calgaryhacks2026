// ============================================
// localStorage service — all persistence logic
// ============================================

import { STORAGE_KEYS } from "../utils/constants";
import type {
  User,
  OnboardingAnswers,
  UserProfile,
  ModulesData,
  ModuleState,
  QuizzesData,
  QuizResult,
} from "../types";

// ---- Helpers ----

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key: string): void {
  localStorage.removeItem(key);
}

// ---- User ----

export function getUser(): User | null {
  return getItem<User>(STORAGE_KEYS.USER);
}

export function saveUser(user: User): void {
  setItem(STORAGE_KEYS.USER, user);
}

export function clearUser(): void {
  removeItem(STORAGE_KEYS.USER);
}

// ---- Onboarding ----

export function getOnboarding(): OnboardingAnswers | null {
  return getItem<OnboardingAnswers>(STORAGE_KEYS.ONBOARDING);
}

export function saveOnboarding(answers: OnboardingAnswers): void {
  setItem(STORAGE_KEYS.ONBOARDING, answers);
}

export function clearOnboarding(): void {
  removeItem(STORAGE_KEYS.ONBOARDING);
}

// ---- Profile ----

export function getProfile(): UserProfile | null {
  return getItem<UserProfile>(STORAGE_KEYS.PROFILE);
}

export function saveProfile(profile: UserProfile): void {
  setItem(STORAGE_KEYS.PROFILE, profile);
}

export function clearProfile(): void {
  removeItem(STORAGE_KEYS.PROFILE);
}

// ---- Modules ----

const DEFAULT_MODULE_STATE: ModuleState = {
  status: "locked",
  content: null,
  generatedAt: null,
};

function getDefaultModules(): ModulesData {
  return {
    module1: { ...DEFAULT_MODULE_STATE, status: "available" },
    module2: { ...DEFAULT_MODULE_STATE },
    module3: { ...DEFAULT_MODULE_STATE },
  };
}

export function getModules(): ModulesData {
  return getItem<ModulesData>(STORAGE_KEYS.MODULES) ?? getDefaultModules();
}

export function saveModules(modules: ModulesData): void {
  setItem(STORAGE_KEYS.MODULES, modules);
}

export function updateModule(
  moduleId: keyof ModulesData,
  updates: Partial<ModuleState>
): void {
  const modules = getModules();
  modules[moduleId] = { ...modules[moduleId], ...updates };
  saveModules(modules);
}

export function clearModules(): void {
  removeItem(STORAGE_KEYS.MODULES);
}

// ---- Quizzes ----

export function getQuizzes(): QuizzesData {
  return getItem<QuizzesData>(STORAGE_KEYS.QUIZZES) ?? {};
}

export function saveQuizResult(
  moduleId: keyof QuizzesData,
  result: QuizResult
): void {
  const quizzes = getQuizzes();
  quizzes[moduleId] = result;
  setItem(STORAGE_KEYS.QUIZZES, quizzes);
}

export function getQuizResult(
  moduleId: keyof QuizzesData
): QuizResult | undefined {
  return getQuizzes()[moduleId];
}

export function clearQuizzes(): void {
  removeItem(STORAGE_KEYS.QUIZZES);
}

// ---- Full Reset ----

export function clearAllData(): void {
  clearUser();
  clearOnboarding();
  clearProfile();
  clearModules();
  clearQuizzes();
}
