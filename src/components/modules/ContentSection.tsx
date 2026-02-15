import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { useState } from "react";
import type { ModuleContentSection } from "../../types";
import {
  Play,
  BarChart3,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

interface ContentSectionProps {
  section: ModuleContentSection;
  index: number;
}

const sectionConfig = {
  video: {
    icon: Play,
    label: "Lesson",
    accent: "border-l-primary",
    headerBg: "bg-primary/5",
    iconColor: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
  infographic: {
    icon: BarChart3,
    label: "Key Concepts",
    accent: "border-l-accent",
    headerBg: "bg-accent/5",
    iconColor: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
  },
  scenario: {
    icon: MessageSquare,
    label: "Real-World Scenario",
    accent: "border-l-blue-500",
    headerBg: "bg-blue-50/50",
    iconColor: "text-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
  takeaways: {
    icon: Lightbulb,
    label: "Takeaways",
    accent: "border-l-green-500",
    headerBg: "bg-green-50/50",
    iconColor: "text-green-600",
    badge: "bg-green-50 text-green-700",
  },
};

export function ContentSection({ section, index }: ContentSectionProps) {
  const config = sectionConfig[section.type];
  const Icon = config.icon;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRead, setIsRead] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 }}
      className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden border-l-4 ${config.accent}`}
    >
      {/* Section header — clickable to collapse */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (isExpanded) setIsRead(true);
        }}
        className={`w-full px-6 py-4 flex items-center justify-between ${config.headerBg} cursor-pointer hover:brightness-[0.98] transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${config.badge} flex items-center justify-center`}>
            <Icon size={18} />
          </div>
          <div className="text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              Part {index + 1}
            </span>
            <span className="text-sm font-bold text-gray-700">
              {config.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRead && (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Content — collapsible */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-8 py-6">
          {/* Title */}
          <h3 className="text-xl font-bold font-heading text-gray-900 mb-5 leading-snug">
            {section.title}
          </h3>

          {/* AI-generated image */}
          {section.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
            >
              <img
                src={section.imageUrl}
                alt={section.title}
                className="w-full h-auto object-cover"
              />
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center">
                AI-generated visual — Claire (Fine-tuned SD 1.5 LoRA)
              </div>
            </motion.div>
          )}

          {/* Markdown content — proper learning typography */}
          <div className="module-content text-gray-700 text-[15px] leading-[1.8] space-y-4">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-gray-900 mt-7 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-[1.8] text-gray-600">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="my-4 ml-1 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-4 ml-1 space-y-2 list-decimal list-inside">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 pl-4 border-l-3 border-primary/30 bg-primary/5 rounded-r-lg py-3 pr-4 text-gray-700 italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {section.content}
            </ReactMarkdown>
          </div>

          {/* Items list (for infographics and takeaways) */}
          {section.items && section.items.length > 0 && (
            <div className="mt-6 space-y-3">
              {section.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + i * 0.06 }}
                  className={`flex items-start gap-4 p-4 rounded-xl ${
                    section.type === "infographic"
                      ? "bg-amber-50/50 border border-amber-100"
                      : "bg-green-50/50 border border-green-100"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      section.type === "infographic"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[14px] text-gray-600 leading-relaxed pt-0.5">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
