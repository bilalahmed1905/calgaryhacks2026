import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Compass, Wrench, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import type { ModuleStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { MODULES_META } from "../../utils/constants";

interface ModuleCardProps {
  moduleId: string;
  status: ModuleStatus;
  isRecommended: boolean;
  quizScore?: number;
  quizTotal?: number;
  index: number;
}

const iconMap: Record<string, typeof Sparkles> = {
  Sparkles: Sparkles,
  Compass: Compass,
  Wrench: Wrench,
};

export function ModuleCard({
  moduleId,
  status,
  isRecommended,
  quizScore,
  quizTotal,
  index,
}: ModuleCardProps) {
  const navigate = useNavigate();
  const meta = MODULES_META[moduleId as keyof typeof MODULES_META];
  if (!meta) return null;

  const Icon = iconMap[meta.icon] ?? Sparkles;
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  const statusConfig = {
    locked: { label: "Locked", variant: "muted" as const },
    available: { label: "Start", variant: "primary" as const },
    in_progress: { label: "In Progress", variant: "accent" as const },
    completed: { label: "Completed", variant: "success" as const },
  };

  const progress =
    isCompleted && quizTotal
      ? 100
      : status === "in_progress"
      ? 50
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      onClick={() => !isLocked && navigate(`/module/${meta.number}`)}
      className={`relative bg-surface rounded-2xl border-2 p-6 shadow-sm transition-all duration-200 ${
        isLocked
          ? "border-border opacity-60 cursor-not-allowed"
          : "border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      }`}
    >
      {/* Recommended badge */}
      {isRecommended && !isCompleted && (
        <div className="absolute -top-3 right-4">
          <Badge label="⭐ Recommended for you" variant="accent" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLocked
              ? "bg-gray-100"
              : isCompleted
              ? "bg-success/10"
              : "bg-primary/10"
          }`}
        >
          {isLocked ? (
            <Lock size={24} className="text-text-light" />
          ) : isCompleted ? (
            <CheckCircle2 size={24} className="text-success" />
          ) : (
            <Icon size={24} className="text-primary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Module {meta.number}
            </span>
            <Badge
              label={statusConfig[status].label}
              variant={statusConfig[status].variant}
            />
          </div>
          <h3 className="text-lg font-bold font-heading text-text mb-1">
            {meta.title}
          </h3>
          <p className="text-sm text-text-muted">{meta.description}</p>

          {/* Progress */}
          {!isLocked && (
            <div className="mt-3 flex items-center gap-3">
              <ProgressBar
                value={progress}
                color={isCompleted ? "success" : "primary"}
                className="flex-1"
              />
              {quizScore !== undefined && quizTotal !== undefined && (
                <span className="text-xs text-text-muted whitespace-nowrap">
                  Quiz: {quizScore}/{quizTotal}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ArrowRight
            size={20}
            className="text-text-light flex-shrink-0 mt-2"
          />
        )}
      </div>
    </motion.div>
  );
}
