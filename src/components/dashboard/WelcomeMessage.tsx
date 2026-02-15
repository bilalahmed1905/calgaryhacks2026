import { motion } from "framer-motion";

interface WelcomeMessageProps {
  message: string;
  userName: string;
}

export function WelcomeMessage({ message, userName }: WelcomeMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold font-heading text-text mb-2">
        Welcome back, {userName} 👋
      </h1>
      <p className="text-text-muted leading-relaxed">{message}</p>
    </motion.div>
  );
}
