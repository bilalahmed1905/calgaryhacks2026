import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { UserProfile } from "../../types";
import { Badge } from "../ui/Badge";

interface ProfileSummaryProps {
  profile: UserProfile;
  userName: string;
}

export function ProfileSummary({ profile, userName }: ProfileSummaryProps) {
  const formatDependency = (level: string) => {
    const map: Record<string, string> = {
      low: "Minimal",
      moderate: "Moderate",
      high: "Frequent",
      very_high: "Heavy",
    };
    return map[level] ?? level;
  };

  const formatMindset = (type: string) => {
    const map: Record<string, string> = {
      task_oriented: "Task-Focused",
      balanced: "Balanced",
      purpose_driven: "Purpose-Driven",
      independent: "Self-Reliant",
    };
    return map[type] ?? type;
  };

  const formatLearning = (format: string) => {
    const map: Record<string, string> = {
      hands_on: "Hands-On",
      visual: "Visual",
      step_by_step: "Step-by-Step",
      summaries: "Summaries",
    };
    return map[format] ?? format;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-md">
          <User size={28} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-heading text-text">
            {userName}
          </h3>
          <p className="text-sm text-text-muted">{profile.label}</p>
        </div>
      </div>

      {/* Traits */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Field</span>
          <Badge label={profile.field} variant="primary" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Year</span>
          <Badge label={profile.year} variant="muted" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">AI Usage</span>
          <Badge
            label={formatDependency(profile.dependencyLevel)}
            variant={
              profile.dependencyLevel === "very_high"
                ? "warning"
                : profile.dependencyLevel === "high"
                ? "accent"
                : "muted"
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Mindset</span>
          <Badge label={formatMindset(profile.mindsetType)} variant="success" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Learning Style</span>
          <Badge label={formatLearning(profile.learningFormat)} variant="muted" />
        </div>
      </div>

      {/* Career Interest */}
      <div className="mt-4 pt-4 border-t border-border">
        <span className="text-xs text-text-light uppercase tracking-wider">
          Career Interest
        </span>
        <p className="text-sm font-medium text-text mt-1">{profile.career}</p>
      </div>
    </motion.div>
  );
}
