import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { ScenarioCard } from "../components/simulator/ScenarioCard";
import { DebriefCard } from "../components/simulator/DebriefCard";
import { AIGeneratingState } from "../components/common/AIGeneratingState";
import { Button } from "../components/ui/Button";
import { getProfile } from "../services/storage";
import { APP_NAME } from "../utils/constants";

const API_BASE = "http://localhost:5001/api";

interface ScenarioChoice {
  id: string;
  text: string;
  approach: string;
}

interface ScenarioData {
  scenario: string;
  vuca_factors: string[];
  choices: ScenarioChoice[];
  round: number;
  total_rounds: number;
}

interface DebriefData {
  badge: string;
  summary: string;
  strengths: string[];
  growth_areas: string[];
  vuca_readiness_score: number;
}

interface ChoiceMade {
  round: number;
  choice_text: string;
  approach: string;
}

type SimState = "intro" | "loading" | "scenario" | "debrief";

export function SimulatorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("module") || "module2";
  const profile = getProfile();

  const [simState, setSimState] = useState<SimState>("intro");
  const [currentScenario, setCurrentScenario] = useState<ScenarioData | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [choicesMade, setChoicesMade] = useState<ChoiceMade[]>([]);
  const [scenarioContext, setScenarioContext] = useState("");
  const [debrief, setDebrief] = useState<DebriefData | null>(null);
  const [isChoosing, setIsChoosing] = useState(false);

  useEffect(() => {
    if (!profile) {
      navigate("/onboarding");
    }
  }, [profile, navigate]);

  const fetchScenario = async (
    round: number,
    prevChoice: string | null,
    context: string
  ) => {
    setSimState("loading");
    try {
      const resp = await fetch(`${API_BASE}/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          round,
          previousChoice: prevChoice,
          scenarioContext: context,
          moduleId,
        }),
      });
      if (!resp.ok) throw new Error("Backend error");
      const data: ScenarioData = await resp.json();
      setCurrentScenario(data);
      setSimState("scenario");
    } catch (err) {
      console.error("Failed to fetch scenario:", err);
      // Use fallback
      setCurrentScenario(getFallbackScenario(round));
      setSimState("scenario");
    }
  };

  const fetchDebrief = async (choices: ChoiceMade[]) => {
    setSimState("loading");
    try {
      const resp = await fetch(`${API_BASE}/scenario-debrief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, choicesMade: choices }),
      });
      if (!resp.ok) throw new Error("Backend error");
      const data: DebriefData = await resp.json();
      setDebrief(data);
      setSimState("debrief");
    } catch (err) {
      console.error("Failed to fetch debrief:", err);
      setDebrief({
        badge: "Adaptive Learner",
        summary: "You navigated uncertainty with thoughtful decision-making. Your choices show a blend of caution and initiative.",
        strengths: ["Willingness to engage", "Thoughtful decision-making"],
        growth_areas: ["Consider more stakeholders", "Think about long-term impact"],
        vuca_readiness_score: 72,
      });
      setSimState("debrief");
    }
  };

  const handleStart = () => {
    fetchScenario(1, null, "");
  };

  const handleChoose = async (choice: ScenarioChoice) => {
    setIsChoosing(true);

    const newChoice: ChoiceMade = {
      round: currentRound,
      choice_text: choice.text,
      approach: choice.approach,
    };
    const updatedChoices = [...choicesMade, newChoice];
    setChoicesMade(updatedChoices);

    const newContext = scenarioContext
      ? `${scenarioContext} | Round ${currentRound}: ${currentScenario?.scenario} Student chose: "${choice.text}" (${choice.approach}).`
      : `Round ${currentRound}: ${currentScenario?.scenario} Student chose: "${choice.text}" (${choice.approach}).`;
    setScenarioContext(newContext);

    if (currentRound >= 3) {
      // Simulation complete — get debrief
      await fetchDebrief(updatedChoices);
    } else {
      // Next round
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      await fetchScenario(nextRound, choice.text, newContext);
    }
    setIsChoosing(false);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={16} className="mr-1" />
              Dashboard
            </Button>
          </div>
          <h1 className="text-lg font-bold font-heading text-primary">
            {APP_NAME}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Intro screen */}
        {simState === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 py-12"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl"
            >
              <Zap size={40} className="text-primary" />
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold font-heading text-gray-900">
                VUCA Scenario Simulator
              </h1>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                Face real AI dilemmas that students encounter today. Make
                decisions under uncertainty across 3 rounds and discover your
                decision-making profile.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {[
                { letter: "V", label: "Volatility", color: "bg-red-50 text-red-600 border-red-200" },
                { letter: "U", label: "Uncertainty", color: "bg-amber-50 text-amber-600 border-amber-200" },
                { letter: "C", label: "Complexity", color: "bg-purple-50 text-purple-600 border-purple-200" },
                { letter: "A", label: "Ambiguity", color: "bg-blue-50 text-blue-600 border-blue-200" },
              ].map(({ letter, label, color }) => (
                <div
                  key={letter}
                  className={`p-3 rounded-xl border text-center ${color}`}
                >
                  <span className="text-2xl font-bold block">{letter}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <Button onClick={handleStart} size="lg">
              <Zap size={18} className="mr-2" />
              Start Simulation
            </Button>
          </motion.div>
        )}

        {/* Loading */}
        {simState === "loading" && (
          <AIGeneratingState
            message={
              currentRound === 1
                ? "Generating your scenario..."
                : currentRound > 3
                ? "Analyzing your decisions..."
                : `Generating Round ${currentRound}...`
            }
          />
        )}

        {/* Active scenario */}
        {simState === "scenario" && currentScenario && (
          <ScenarioCard
            scenario={currentScenario.scenario}
            vucaFactors={currentScenario.vuca_factors}
            choices={currentScenario.choices}
            round={currentScenario.round}
            totalRounds={currentScenario.total_rounds}
            onChoose={handleChoose}
            isLoading={isChoosing}
          />
        )}

        {/* Debrief */}
        {simState === "debrief" && debrief && (
          <DebriefCard
            badge={debrief.badge}
            summary={debrief.summary}
            strengths={debrief.strengths}
            growthAreas={debrief.growth_areas}
            vucaReadinessScore={debrief.vuca_readiness_score}
          />
        )}
      </main>
    </div>
  );
}

// Fallback scenarios if backend is down
function getFallbackScenario(round: number): ScenarioData {
  const scenarios: ScenarioData[] = [
    {
      scenario:
        "Your professor just announced a zero-tolerance policy on AI-generated content. Your partner on a major project admits they used ChatGPT for their entire section. The deadline is tomorrow.",
      vuca_factors: ["uncertainty", "complexity"],
      choices: [
        { id: "a", text: "Confront your partner and insist they rewrite everything", approach: "Ethical Leader" },
        { id: "b", text: "Report it to the professor before submission", approach: "Rule Follower" },
        { id: "c", text: "Help them rewrite the AI parts in their own words tonight", approach: "Pragmatic Collaborator" },
      ],
      round: 1,
      total_rounds: 3,
    },
    {
      scenario:
        "Word has spread about the incident. Students are divided on AI policies. A petition is circulating, and your professor asks YOU in front of the class: 'What should our AI policy be?'",
      vuca_factors: ["volatility", "ambiguity"],
      choices: [
        { id: "a", text: "Argue for clear guidelines allowing AI as a tool with mandatory disclosure", approach: "Systems Thinker" },
        { id: "b", text: "Support the ban — students need to build skills without AI crutches", approach: "Traditionalist" },
        { id: "c", text: "Suggest the class votes and decides democratically", approach: "Democratic Leader" },
      ],
      round: 2,
      total_rounds: 3,
    },
    {
      scenario:
        "The university is now drafting a campus-wide AI policy and wants student reps. You've been nominated. A tech company offers free AI tools — but only if the university drops ALL restrictions.",
      vuca_factors: ["volatility", "uncertainty", "complexity", "ambiguity"],
      choices: [
        { id: "a", text: "Accept the tools but require mandatory AI literacy training first", approach: "Strategic Thinker" },
        { id: "b", text: "Reject the corporate offer to keep education independent", approach: "Ethical Guardian" },
        { id: "c", text: "Propose a one-semester pilot with strict monitoring", approach: "Adaptive Innovator" },
      ],
      round: 3,
      total_rounds: 3,
    },
  ];
  return scenarios[Math.min(round - 1, 2)];
}
