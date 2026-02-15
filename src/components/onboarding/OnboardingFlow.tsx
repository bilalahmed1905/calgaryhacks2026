import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { Button } from "../ui/Button";
import { ProgressDots } from "./ProgressDots";
import { QuestionCard } from "./QuestionCard";
import { AIGeneratingState } from "../common/AIGeneratingState";
import { ONBOARDING_QUESTIONS } from "./questions";
import { useOnboarding } from "../../hooks/useOnboarding";
import { analyzeProfile } from "../../services/profileAnalyzer";
import { saveProfile, saveModules } from "../../services/storage";
import { getModules } from "../../services/storage";
import { APP_NAME } from "../../utils/constants";

export function OnboardingFlow() {
  const navigate = useNavigate();
  const {
    step,
    answers,
    updateAnswer,
    nextStep,
    prevStep,
    canProceed,
    completeOnboarding,
  } = useOnboarding();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleComplete = useCallback(async () => {
    const completed = completeOnboarding();
    setIsGenerating(true);

    // Analyze profile
    const profile = analyzeProfile(completed);
    saveProfile(profile);

    // Set up module states based on recommendation
    const modules = getModules();
    const recommendedKey =
      `module${profile.recommendedStartModule}` as keyof typeof modules;
    modules[recommendedKey] = { ...modules[recommendedKey], status: "available" };
    // Ensure module1 is always available
    modules.module1 = { ...modules.module1, status: "available" };
    saveModules(modules);

    // Simulate AI generation time
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    navigate("/dashboard");
  }, [completeOnboarding, navigate]);

  if (isGenerating) {
    return <AIGeneratingState message="Building your personalized path..." />;
  }

  const currentQuestion = ONBOARDING_QUESTIONS[step - 1];
  const isLastStep = step === 5;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold font-heading text-primary">
          {APP_NAME}
        </h1>
        <ProgressDots total={5} current={step} />
        <span className="text-sm text-text-muted">
          {step} of 5
        </span>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={step}
            question={currentQuestion}
            answers={answers as Record<string, string>}
            onAnswer={updateAnswer}
          />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="w-full px-6 py-6 flex items-center justify-between max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={step === 1}
          className={step === 1 ? "invisible" : ""}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        {isLastStep ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleComplete}
            disabled={!canProceed()}
          >
            <Rocket size={18} className="mr-2" />
            Build My Path
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Continue
            <ArrowRight size={18} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
