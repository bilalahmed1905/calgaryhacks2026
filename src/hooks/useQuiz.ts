import { useState, useCallback } from "react";
import type { QuizQuestion } from "../types";
import { saveQuizResult, getQuizResult } from "../services/storage";
import { generateQuizQuestions } from "../services/ai";
import type { UserProfile } from "../types";

export function useQuiz(moduleId: "module1" | "module2" | "module3") {
  const existingResult = getQuizResult(moduleId);

  const [questions, setQuestions] = useState<QuizQuestion[]>(
    existingResult?.questions ?? []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    existingResult?.answers ?? []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(!!existingResult);
  const [score, setScore] = useState(existingResult?.score ?? 0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const loadQuiz = useCallback(
    async (profile: UserProfile) => {
      if (questions.length > 0) return;
      setIsGenerating(true);
      try {
        const q = await generateQuizQuestions(moduleId, profile);
        setQuestions(q);
      } finally {
        setIsGenerating(false);
      }
    },
    [moduleId, questions.length]
  );

  const selectAnswer = useCallback(
    (answerIndex: number) => {
      if (showFeedback) return;
      setSelectedAnswer(answerIndex);
    },
    [showFeedback]
  );

  const confirmAnswer = useCallback(() => {
    if (selectedAnswer === null) return;
    setShowFeedback(true);
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    const isCorrect =
      selectedAnswer === questions[currentIndex].correctIndex;
    if (isCorrect) setScore((s) => s + 1);
  }, [selectedAnswer, answers, questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentIndex === questions.length - 1) {
      // Quiz complete
      const finalScore = answers.reduce((acc, ans, idx) => {
        return acc + (ans === questions[idx].correctIndex ? 1 : 0);
      }, 0);
      setScore(finalScore);
      setIsComplete(true);
      saveQuizResult(moduleId, {
        questions,
        answers,
        score: finalScore,
        completedAt: new Date().toISOString(),
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions, answers, moduleId]);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setScore(0);
    setIsComplete(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  return {
    questions,
    currentIndex,
    answers,
    isGenerating,
    isComplete,
    score,
    selectedAnswer,
    showFeedback,
    loadQuiz,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    resetQuiz,
  };
}
