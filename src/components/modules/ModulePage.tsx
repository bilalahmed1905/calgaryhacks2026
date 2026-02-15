import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "../ui/Button";
import { ContentSection } from "./ContentSection";
import { AIGeneratingState } from "../common/AIGeneratingState";
import { useModuleContent } from "../../hooks/useModuleContent";
import { getProfile } from "../../services/storage";
import { MODULES_META, APP_NAME } from "../../utils/constants";
import type { ModulesData } from "../../types";

export function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const moduleId = `module${id}` as keyof ModulesData;
  const meta = MODULES_META[moduleId as keyof typeof MODULES_META];
  const profile = getProfile();

  const { moduleState, isGenerating, loadContent } =
    useModuleContent(moduleId);

  useEffect(() => {
    if (!profile) {
      navigate("/");
      return;
    }
    if (!moduleState.content) {
      loadContent(profile);
    }
  }, [profile, moduleState.content, loadContent, navigate]);

  if (!meta || !profile) {
    navigate("/dashboard");
    return null;
  }

  if (isGenerating || !moduleState.content) {
    return (
      <AIGeneratingState
        message={`Personalizing Module ${meta.number} for you...`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="w-full px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} className="mr-2" />
            Dashboard
          </Button>
          <h1 className="text-lg font-bold font-heading text-primary">
            {APP_NAME}
          </h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Module header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Module {meta.number}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-text mt-1">
            {meta.title}
          </h1>
          <p className="text-text-muted mt-2">{meta.description}</p>
        </motion.div>

        {/* Content sections */}
        <div className="space-y-6">
          {moduleState.content.sections.map((section, idx) => (
            <ContentSection key={idx} section={section} index={idx} />
          ))}
        </div>

        {/* Quiz CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-8">
            <BookOpen size={40} className="text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold font-heading text-text mb-2">
              Ready to test your understanding?
            </h3>
            <p className="text-text-muted mb-6">
              Take the quiz to solidify what you've learned and unlock the next
              module.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/module/${id}/quiz`)}
            >
              Take the Quiz
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
