import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { ProfileSummary } from "./ProfileSummary";
import { ModuleCard } from "./ModuleCard";
import { WelcomeMessage } from "./WelcomeMessage";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { getUser, getProfile, getModules, getQuizzes, clearAllData } from "../../services/storage";
import { generateWelcomeMessage } from "../../services/ai";
import type { ModulesData, QuizzesData } from "../../types";
import { APP_NAME } from "../../utils/constants";

export function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const profile = getProfile();
  const [modules, setModules] = useState<ModulesData>(getModules());
  const [quizzes] = useState<QuizzesData>(getQuizzes());
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      navigate("/");
      return;
    }

    const loadWelcome = async () => {
      try {
        const msg = await generateWelcomeMessage(user.name, profile);
        setWelcomeMsg(msg);
      } catch {
        setWelcomeMsg(
          `Welcome to ${APP_NAME}, ${user.name}! Your personalized learning path is ready.`
        );
      } finally {
        setLoading(false);
      }
    };

    loadWelcome();
  }, [user, profile, navigate]);

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure? This will reset all your progress and data."
      )
    ) {
      clearAllData();
      navigate("/");
    }
  };

  // Refresh modules on focus (in case they changed from module pages)
  useEffect(() => {
    const handler = () => setModules(getModules());
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  if (!user || !profile) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Preparing your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="w-full px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold font-heading text-primary">
            {APP_NAME}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <WelcomeMessage message={welcomeMsg} userName={user.name} />

        {/* Content grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile */}
          <div className="lg:col-span-1">
            <ProfileSummary profile={profile} userName={user.name} />
          </div>

          {/* Main - Modules */}
          <div className="lg:col-span-2 space-y-4">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold font-heading text-text"
            >
              Your Learning Path
            </motion.h2>

            {(["module1", "module2", "module3"] as const).map(
              (moduleId, idx) => {
                const quiz = quizzes[moduleId];
                return (
                  <ModuleCard
                    key={moduleId}
                    moduleId={moduleId}
                    status={modules[moduleId].status}
                    isRecommended={
                      profile.recommendedStartModule === idx + 1
                    }
                    quizScore={quiz?.score}
                    quizTotal={quiz?.questions.length}
                    index={idx}
                  />
                );
              }
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
