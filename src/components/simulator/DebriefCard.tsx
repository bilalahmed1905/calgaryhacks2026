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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Badge + Score */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20"
        >
          <Award size={28} className="text-primary" />
          <span className="text-2xl font-bold font-heading text-gray-900">
            {badge}
          </span>
        </motion.div>

        {/* Circular score */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#cf0722"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(vucaReadinessScore / 100) * 327} 327`}
                initial={{ strokeDasharray: "0 327" }}
                animate={{
                  strokeDasharray: `${(vucaReadinessScore / 100) * 327} 327`,
                }}
                transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-3xl font-bold text-gray-900"
              >
                {vucaReadinessScore}
              </motion.span>
              <span className="text-xs text-gray-500 font-medium">
                VUCA Score
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 text-center"
      >
        <p className="text-gray-600 text-[15px] leading-[1.8]">{summary}</p>
      </motion.div>

      {/* Strengths + Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-green-50 rounded-xl border border-green-100 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-green-600" />
            <h3 className="font-bold text-green-800 text-sm">Your Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-amber-50 rounded-xl border border-amber-100 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-amber-600" />
            <h3 className="font-bold text-amber-800 text-sm">Growth Areas</h3>
          </div>
          <ul className="space-y-2">
            {growthAreas.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Back to Dashboard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="flex justify-center pt-4"
      >
        <Button onClick={() => navigate("/dashboard")} size="lg">
          Back to Dashboard
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
