import { useState, useCallback } from "react";
import type { OnboardingAnswers } from "../types";
import { getOnboarding, saveOnboarding } from "../services/storage";

interface PartialAnswers {
  q1_major?: string;
  q1_year?: string;
  q1_career?: string;
  q2_ai_usage?: string;
  q3_biggest_fear?: string;
  q3_other_text?: string;
  q4_learning_style?: string;
  q5_mindset?: string;
}

export function useOnboarding() {
  const existing = getOnboarding();
  const [step, setStep] = useState(existing ? 6 : 1); // 6 = done
  const [answers, setAnswers] = useState<PartialAnswers>(existing ?? {});
  const [isComplete, setIsComplete] = useState(!!existing);

  const updateAnswer = useCallback(
    (key: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, 6));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return !!(answers.q1_major && answers.q1_year && answers.q1_career);
      case 2:
        return !!answers.q2_ai_usage;
      case 3:
        return !!answers.q3_biggest_fear;
      case 4:
        return !!answers.q4_learning_style;
      case 5:
        return !!answers.q5_mindset;
      default:
        return false;
    }
  }, [step, answers]);

  const completeOnboarding = useCallback((): OnboardingAnswers => {
    const completed: OnboardingAnswers = {
      q1_major: answers.q1_major as OnboardingAnswers["q1_major"],
      q1_year: answers.q1_year as OnboardingAnswers["q1_year"],
      q1_career: answers.q1_career ?? "",
      q2_ai_usage: answers.q2_ai_usage as OnboardingAnswers["q2_ai_usage"],
      q3_biggest_fear:
        answers.q3_biggest_fear as OnboardingAnswers["q3_biggest_fear"],
      q3_other_text: answers.q3_other_text,
      q4_learning_style:
        answers.q4_learning_style as OnboardingAnswers["q4_learning_style"],
      q5_mindset: answers.q5_mindset as OnboardingAnswers["q5_mindset"],
      completedAt: new Date().toISOString(),
    };
    saveOnboarding(completed);
    setIsComplete(true);
    return completed;
  }, [answers]);

  return {
    step,
    answers,
    isComplete,
    updateAnswer,
    nextStep,
    prevStep,
    canProceed,
    completeOnboarding,
  };
}
