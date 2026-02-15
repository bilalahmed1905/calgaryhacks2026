import { motion } from "framer-motion";
import { AlertTriangle, HelpCircle, Layers, Eye } from "lucide-react";

interface ScenarioChoice {
  id: string;
  text: string;
  approach: string;
}

interface ScenarioCardProps {
  scenario: string;
  vucaFactors: string[];
  choices: ScenarioChoice[];
  round: number;
  totalRounds: number;
  onChoose: (choice: ScenarioChoice) => void;
  isLoading: boolean;
}

const vucaIcons: Record<string, { icon: typeof AlertTriangle; color: string; label: string }> = {
  volatility: { icon: AlertTriangle, color: "bg-red-100 text-red-600", label: "Volatility" },
  uncertainty: { icon: HelpCircle, color: "bg-amber-100 text-amber-600", label: "Uncertainty" },
  complexity: { icon: Layers, color: "bg-purple-100 text-purple-600", label: "Complexity" },
  ambiguity: { icon: Eye, color: "bg-blue-100 text-blue-600", label: "Ambiguity" },
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Round indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((r) => (
            <div
              key={r}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                r === round
                  ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                  : r < round
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {r < round ? "✓" : r}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500 font-medium">
          Round {round} of {totalRounds}
        </span>
      </div>

      {/* VUCA factors */}
      <div className="flex flex-wrap gap-2">
        {vucaFactors.map((factor) => {
          const config = vucaIcons[factor.toLowerCase()] || vucaIcons.uncertainty;
          const Icon = config.icon;
          return (
            <span
              key={factor}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}
            >
              <Icon size={14} />
              {config.label}
            </span>
          );
        })}
      </div>

      {/* Scenario text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm"
      >
        <p className="text-gray-800 text-[16px] leading-[1.8]">{scenario}</p>
      </motion.div>

      {/* Choices */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          What do you do?
        </p>
        {choices.map((choice, i) => (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
            onClick={() => onChoose(choice)}
            className="w-full text-left p-5 rounded-xl border-2 border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-wait"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:text-primary transition-colors">
                {choice.id.toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">
                  {choice.text}
                </p>
                <span className="inline-block mt-2 text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                  {choice.approach}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
