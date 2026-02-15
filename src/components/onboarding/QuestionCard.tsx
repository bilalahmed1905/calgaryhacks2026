import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import type { OnboardingQuestion } from "./questions";

interface QuestionCardProps {
  question: OnboardingQuestion;
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
}

export function QuestionCard({
  question,
  answers,
  onAnswer,
}: QuestionCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-2 mb-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-text">
            {question.title}
          </h2>
          <button
            className="mt-1 text-text-light hover:text-primary transition-colors cursor-pointer"
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label="Why we ask this"
          >
            <HelpCircle size={20} />
          </button>
        </div>
        <p className="text-text-muted text-lg">{question.subtitle}</p>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded-xl text-sm text-text-muted"
          >
            💡 {question.whyWeAsk}
          </motion.div>
        )}
      </div>

      {/* Multi-part question (Q1) */}
      {question.type === "multi-part" && question.parts && (
        <div className="space-y-6">
          {question.parts.map((part) => (
            <div key={part.id}>
              <label className="block text-sm font-semibold text-text mb-2">
                {part.label}
              </label>
              {part.type === "dropdown" && part.options && (
                <select
                  value={answers[part.id] ?? ""}
                  onChange={(e) => onAnswer(part.id, e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select...</option>
                  {part.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {part.type === "text" && (
                <input
                  type="text"
                  value={answers[part.id] ?? ""}
                  onChange={(e) => onAnswer(part.id, e.target.value)}
                  placeholder={part.placeholder}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Radio question */}
      {question.type === "radio" && question.options && (
        <div className="space-y-3">
          {question.options.map((opt) => {
            const fieldKey =
              question.id === "q2"
                ? "q2_ai_usage"
                : question.id === "q3"
                ? "q3_biggest_fear"
                : question.id === "q4"
                ? "q4_learning_style"
                : "q5_mindset";
            const isSelected = answers[fieldKey] === opt.value;

            return (
              <div key={opt.value}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onAnswer(fieldKey, opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        isSelected ? "border-primary bg-primary" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className={`font-medium ${ isSelected ? "text-primary" : "text-text" }`}>{opt.label}</span>
                      {opt.description && (
                        <p className="text-sm text-text-muted mt-0.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>

                {/* "Other" text input for Q3 */}
                {opt.value === "E" && isSelected && question.id === "q3" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 ml-8"
                  >
                    <input
                      type="text"
                      value={answers.q3_other_text ?? ""}
                      onChange={(e) => onAnswer("q3_other_text", e.target.value)}
                      placeholder="Tell us what worries you..."
                      className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text text-sm placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
