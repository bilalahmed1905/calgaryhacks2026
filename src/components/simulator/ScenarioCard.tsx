import { motion } from "framer-motion";
import { AlertTriangle, Zap, HelpCircle, Layers, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

interface Choice {
  id: string;
  text: string;
  approach: string;
}

interface ScenarioCardProps {
  scenario: string;
  vucaFactors: string[];
  choices: Choice[];
  round: number;
  totalRounds: number;
  onChoose: (choice: Choice) => void;
  isLoading: boolean;
}

const vucaIcons: Record<string, { icon: typeof Zap; color: string; label: string }> = {
  volatility: { icon: Zap, color: "text-red-500 bg-red-50 border-red-200", label: "Volatility" },
  uncertainty: { icon: HelpCircle, color: "text-amber-500 bg-amber-50 border-amber-200", label: "Uncertainty" },
  complexity: { icon: Layers, color: "text-purple-500 bg-purple-50 border-purple-200", label: "Complexity" },
  ambiguity: { icon: AlertTriangle, color: "text-blue-500 bg-blue-50 border-blue-200", label: "Ambiguity" },
};

export function ScenarioCard({
  scenario,
  vucaFactors,
  choices,
  round,
  totalRounds,
  onChoose,
  isLoading,
}: ScenarioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Round indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < round ? "bg-primary" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-muted font-medium">
        Round {round} of {totalRounds}
      </p>

      {/* Scenario */}
      <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
        {/* VUCA badges */}
        <div className="flex flex-wrap gap-2">
          {vucaFactors.map((f) => {
            const cfg = vucaIcons[f.toLowerCase()];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <span
                key={f}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}
              >
                <Icon size={12} />
                {cfg.label}
              </span>
            );
          })}
        </div>

        <p className="text-text leading-relaxed text-[15px]">{scenario}</p>
      </div>

      {/* Choices */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-text">What do you do?</p>
        {choices.map((c) => (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
            onClick={() => onChoose(c)}
            className="w-full text-left p-4 rounded-xl border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                {c.id.toUpperCase()}
              </span>
              <div>
                <p className="text-text text-sm leading-relaxed">{c.text}</p>
                <p className="text-xs text-muted mt-1 italic">{c.approach}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-muted text-sm">
          <Loader2 size={16} className="animate-spin" />
          Processing your choice...
        </div>
      )}
    </motion.div>
  );
}
