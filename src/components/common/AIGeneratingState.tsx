import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
      >
        <Sparkles size={40} className="text-white" />
      </motion.div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heading text-text">
          {message}
        </h2>
        <p className="text-text-muted">
          {APP_NAME} is personalizing content just for you
        </p>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-3 h-3 bg-primary rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}
