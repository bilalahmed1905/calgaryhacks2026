import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { APP_NAME } from "../../utils/constants";

interface AIGeneratingStateProps {
  message?: string;
}

export function AIGeneratingState({
  message = "Building your personalized path...",
}: AIGeneratingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
    >
      {/* Logo / icon */}
      <div className="relative">
        {/* Outer pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 w-24 h-24 rounded-2xl bg-primary/20"
        />
        {/* Second ring */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          className="absolute inset-0 w-24 h-24 rounded-2xl bg-primary/15"
        />
        {/* Core icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-24 h-24 bg-white rounded-2xl border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10"
        >
          <Brain size={40} className="text-primary" />
        </motion.div>
      </div>

      {/* Text */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold font-heading text-gray-900">
          {message}
        </h2>
        <p className="text-gray-500 text-sm">
          {APP_NAME} is analyzing your profile and generating content
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </div>
    </motion.div>
  );
}
