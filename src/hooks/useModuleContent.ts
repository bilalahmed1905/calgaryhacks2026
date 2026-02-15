import { useState, useCallback } from "react";
import type { ModulesData, ModuleState, ModuleContent } from "../types";
import { getModules, updateModule } from "../services/storage";
import { generateModuleContent } from "../services/ai";
import type { UserProfile } from "../types";

export function useModuleContent(moduleId: keyof ModulesData) {
  const [moduleState, setModuleState] = useState<ModuleState>(() => {
    const modules = getModules();
    return modules[moduleId];
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const refresh = useCallback(() => {
    const modules = getModules();
    setModuleState(modules[moduleId]);
  }, [moduleId]);

  const loadContent = useCallback(
    async (profile: UserProfile) => {
      // If content already cached, use it
      if (moduleState.content) return moduleState.content;

      setIsGenerating(true);
      try {
        const content: ModuleContent = await generateModuleContent(
          moduleId,
          profile
        );
        updateModule(moduleId, {
          status: "in_progress",
          content,
          generatedAt: new Date().toISOString(),
        });
        const updated = { ...moduleState, status: "in_progress" as const, content, generatedAt: new Date().toISOString() };
        setModuleState(updated);
        return content;
      } finally {
        setIsGenerating(false);
      }
    },
    [moduleId, moduleState]
  );

  return { moduleState, isGenerating, loadContent, refresh };
}
