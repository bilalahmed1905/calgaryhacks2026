import { motion } from "framer-motion";
import { Award, TrendingUp, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

interface DebriefCardProps {
  badge: string;
  summary: string;
  strengths: string[];
  growthAreas: string[];
  vucaReadinessScore: number;
}

export function DebriefCard({
  badge,
  summary,
  strengths,
  growthAreas,
  vucaReadinessScore,
}: DebriefCardProps) {
  const navigate = useNavigate();
  const scoreColor =
    vucaReadinessScore >= 80
      ? "text-green-500"
      : vucaReadinessScore >= 60
      ? "text-amber-500"
      : "text-red-500";

  const strokeColor =
    vucaReadinessScore >= 80
      ? "stroke-green-500"
      : vucaReadinessScore >= 60
      ? "stroke-amber-500"
      : "stroke-red-500";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (vucaReadinessScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Badge */}
      <div className="text-center space-y-4 py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl"
        >
          <Award size={40} className="text-primary" />
        </motion.div>
        <div>
          <p className="text-sm text-muted font-medium">Your Decision Profile</p>
          <h2 className="text-2xl font-bold font-heading text-text mt-1">
            {badge}
          </h2>
        </div>
      </div>

      {/* Score ring */}
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              className={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {vucaReadinessScore}
            </span>
            <span className="text-xs text-muted">VUCA Score</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <p className="text-text leading-relaxed text-[15px]">{summary}</p>
      </div>

      {/* Strengths & Growth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-2xl border border-green-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp size={18} />
            <h3 className="font-bold text-sm">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-600">
            <Target size={18} />
            <h3 className="font-bold text-sm">Growth Areas</h3>
          </div>
          <ul className="space-y-2">
            {growthAreas.map((g, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
          Try Again
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="flex-1">
          Back to Dashboard
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
