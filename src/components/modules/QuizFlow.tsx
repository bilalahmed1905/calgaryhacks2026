import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "../ui/Button";
import { AIGeneratingState } from "../common/AIGeneratingState";
import { useQuiz } from "../../hooks/useQuiz";
import { getProfile, updateModule } from "../../services/storage";
import { MODULES_META, APP_NAME } from "../../utils/constants";
import type { ModulesData } from "../../types";

export function QuizFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const moduleId = `module${id}` as "module1" | "module2" | "module3";
  const meta = MODULES_META[moduleId as keyof typeof MODULES_META];
  const profile = getProfile();

  const {
    questions,
    currentIndex,
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
  } = useQuiz(moduleId);

  useEffect(() => {
    if (!profile) {
      navigate("/");
      return;
    }
    loadQuiz(profile);
  }, [profile, loadQuiz, navigate]);

  // When quiz completes, unlock next module
  useEffect(() => {
    if (isComplete && id) {
      const num = parseInt(id);
      updateModule(moduleId as keyof ModulesData, { status: "completed" });
      if (num < 3) {
        const nextModuleId = `module${num + 1}` as keyof ModulesData;
        updateModule(nextModuleId, { status: "available" });
      }
    }
  }, [isComplete, id, moduleId]);

  if (!meta || !profile) return null;

  if (isGenerating) {
    return <AIGeneratingState message="Generating your quiz questions..." />;
  }

  if (questions.length === 0) return null;

  // ---- Quiz Complete Screen ----
  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-surface rounded-2xl border border-border shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Trophy
              size={64}
              className={`mx-auto mb-4 ${
                passed ? "text-accent" : "text-text-muted"
              }`}
            />
          </motion.div>

          <h2 className="text-2xl font-bold font-heading text-text mb-2">
            {passed ? "Great job!" : "Keep learning!"}
          </h2>
          <p className="text-text-muted mb-4">
            You scored {score} out of {questions.length} ({percentage}%)
          </p>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${
                passed ? "bg-success" : "bg-accent"
              }`}
            />
          </div>

          {passed && parseInt(id!) < 3 && (
            <p className="text-sm text-success font-medium mb-6">
              🎉 Module {parseInt(id!) + 1} has been unlocked!
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                resetQuiz();
                loadQuiz(profile);
              }}
            >
              <RotateCcw size={16} className="mr-2" />
              Retry Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- Quiz Question Screen ----
  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="w-full px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/module/${id}`)}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Module
          </Button>
          <h1 className="text-lg font-bold font-heading text-primary">
            {APP_NAME}
          </h1>
          <span className="text-sm text-text-muted">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              Module {meta.number} — Question {currentIndex + 1}
            </p>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-text mb-6">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let borderColor = "border-border hover:border-primary/30";
                let bg = "bg-surface";

                if (showFeedback) {
                  if (isCorrect) {
                    borderColor = "border-success";
                    bg = "bg-success/5";
                  } else if (isSelected && !isCorrect) {
                    borderColor = "border-error";
                    bg = "bg-error/5";
                  }
                } else if (isSelected) {
                  borderColor = "border-primary";
                  bg = "bg-primary/5";
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!showFeedback ? { scale: 1.01 } : {}}
                    whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    onClick={() => selectAnswer(idx)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer disabled:cursor-default ${borderColor} ${bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          showFeedback && isCorrect
                            ? "border-success text-success"
                            : showFeedback && isSelected
                            ? "border-error text-error"
                            : isSelected
                            ? "border-primary text-primary"
                            : "border-gray-300 text-text-muted"
                        }`}
                      >
                        {showFeedback && isCorrect ? (
                          <CheckCircle2 size={18} />
                        ) : showFeedback && isSelected ? (
                          <XCircle size={18} />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </div>
                      <span className="text-text font-medium">{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl border ${
                  selectedAnswer === currentQ.correctIndex
                    ? "bg-success/5 border-success/20"
                    : "bg-error/5 border-error/20"
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {selectedAnswer === currentQ.correctIndex
                    ? "✅ Correct!"
                    : "❌ Not quite"}
                </p>
                <p className="text-sm text-text-muted">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-8 flex justify-end">
              {!showFeedback ? (
                <Button
                  variant="primary"
                  onClick={confirmAnswer}
                  disabled={selectedAnswer === null}
                >
                  Confirm Answer
                </Button>
              ) : (
                <Button variant="primary" onClick={nextQuestion}>
                  {currentIndex === questions.length - 1 ? (
                    "See Results"
                  ) : (
                    <>
                      Next Question
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
