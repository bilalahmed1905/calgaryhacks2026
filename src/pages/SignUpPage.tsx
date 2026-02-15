import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { APP_NAME } from "../utils/constants";
import { saveUser, getUser } from "../services/storage";
import { useEffect } from "react";

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = getUser();
    if (user) navigate("/onboarding");
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    saveUser({
      name: name.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    });
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold font-heading text-primary">
          {APP_NAME}
        </h1>
        <div className="w-16" />
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading text-text mb-2">
              Let's get started
            </h2>
            <p className="text-text-muted">
              We just need your name and email to begin your journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-border rounded-xl bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-border rounded-xl bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!name.trim() || !email.trim()}
            >
              Continue to Questions
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          <p className="text-xs text-text-light text-center mt-6">
            Your data is stored locally on your device. No account is created on
            any server.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
