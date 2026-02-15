import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, BookOpen } from "lucide-react";
import { Button } from "../components/ui/Button";
import { APP_NAME } from "../utils/constants";
import { getUser, getOnboarding } from "../services/storage";

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    const onboarding = getOnboarding();
    if (user && onboarding) {
      navigate("/dashboard");
    } else if (user) {
      navigate("/onboarding");
    }
  }, [navigate]);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Personalized Content",
      description:
        "Every module is generated based on YOUR academic background, career goals, and learning style.",
    },
    {
      icon: Shield,
      title: "Build Career Confidence",
      description:
        "Discover what makes you irreplaceable and learn to navigate uncertainty with clarity.",
    },
    {
      icon: Zap,
      title: "Practical AI Skills",
      description:
        "Master effective, ethical AI usage with hands-on scenarios tailored to your field.",
    },
    {
      icon: BookOpen,
      title: "Bite-Sized Modules",
      description:
        "3 focused modules with interactive content and quizzes — no fluff, no filler.",
    },
  ];

  const competitors = [
    {
      name: "LinkedIn Learning",
      limitation: "Generic courses, no personalization",
      advantage: "AI-powered custom content based on YOUR assessment",
    },
    {
      name: "Career Center Websites",
      limitation: "Static PDFs, outdated advice",
      advantage: "Real-time AI uncertainty training + interactive modules",
    },
    {
      name: "ChatGPT / Claude",
      limitation: "No structure, passive Q&A chatbot",
      advantage: "Purpose-built learning modules with fine-tuned AI content generation",
    },
    {
      name: "Coursera / Udemy",
      limitation: "Pay-per-course, time-intensive",
      advantage: "Free, bite-sized modules (5-8 questions max), instant personalization",
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-xl font-bold font-heading text-primary">
          {APP_NAME}
        </h1>
        <Button variant="primary" size="sm" onClick={() => navigate("/signup")}>
          Get Started
        </Button>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            AI-Powered Learning Journey
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-text leading-tight mb-6">
            Your Path to
            <span className="text-primary block">Career Clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-8">
            Personalized learning modules that help you build confidence,
            navigate AI uncertainty, and develop practical skills — all tailored
            to your field and goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/signup")}
            >
              Start Your Journey — Free
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}>
              See How It Works
            </Button>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold font-heading text-text mb-4">
            How It Works
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            A structured journey from signup to career clarity in 4 simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Sign Up", desc: "Quick account creation" },
            {
              step: "2",
              title: "5 Questions",
              desc: "We learn about you deeply",
            },
            {
              step: "3",
              title: "Your Dashboard",
              desc: "Personalized learning path",
            },
            {
              step: "4",
              title: "3 Modules",
              desc: "AI-generated content + quizzes",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-bold font-heading text-text mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-text-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold font-heading text-text mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Competitor Table */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold font-heading text-text mb-4">
            Why {APP_NAME}?
          </h2>
          <p className="text-text-muted">
            See how we compare to existing solutions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-primary/5">
                <th className="text-left px-6 py-4 text-sm font-semibold text-text">
                  Competitors
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-text">
                  Limitations
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-primary">
                  {APP_NAME} Advantage
                </th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr
                  key={i}
                  className="border-t border-border hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-text">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {c.limitation}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary font-medium">
                    {c.advantage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold font-heading mb-4">
            Ready to find your path?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Join students who are building career clarity with personalized,
            AI-powered learning modules.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/signup")}
          >
            Start Your Journey — Free
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-border text-center">
        <p className="text-sm text-text-muted">
          Built with ❤️ for CalgaryHacks 2026
        </p>
      </footer>
    </div>
  );
}
