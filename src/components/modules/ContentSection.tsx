import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import type { ModuleContentSection } from "../../types";
import { Play, BarChart3, MessageSquare, Lightbulb } from "lucide-react";

interface ContentSectionProps {
  section: ModuleContentSection;
  index: number;
}

const iconMap = {
  video: Play,
  infographic: BarChart3,
  scenario: MessageSquare,
  takeaways: Lightbulb,
};

const labelMap = {
  video: "Video Content",
  infographic: "Infographic",
  scenario: "Interactive Scenario",
  takeaways: "Key Takeaways",
};

export function ContentSection({ section, index }: ContentSectionProps) {
  const Icon = iconMap[section.type];
  const label = labelMap[section.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Section header */}
      <div
        className={`px-6 py-3 flex items-center gap-2 border-b border-border ${
          section.type === "video"
            ? "bg-primary/5"
            : section.type === "infographic"
            ? "bg-accent/5"
            : section.type === "scenario"
            ? "bg-blue-50"
            : "bg-success/5"
        }`}
      >
        <Icon
          size={18}
          className={
            section.type === "video"
              ? "text-primary"
              : section.type === "infographic"
              ? "text-accent-dark"
              : section.type === "scenario"
              ? "text-blue-600"
              : "text-success"
          }
        />
        <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold font-heading text-text mb-4">
          {section.title}
        </h3>

        {/* Markdown content */}
        <div className="prose prose-sm max-w-none text-text leading-relaxed">
          <ReactMarkdown>{section.content}</ReactMarkdown>
        </div>

        {/* Items list (for infographics and takeaways) */}
        {section.items && section.items.length > 0 && (
          <ul className="mt-4 space-y-3">
            {section.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + i * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  section.type === "infographic"
                    ? "bg-accent/5 border border-accent/10"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <span className="text-sm text-text leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
