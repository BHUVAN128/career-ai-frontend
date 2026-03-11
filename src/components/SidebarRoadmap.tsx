import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Lock, Play, BookOpen, HelpCircle, Code, FolderGit2, PenLine } from "lucide-react";
import { type RoadmapStep, type RoadmapPhase } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

const typeIcons: Record<RoadmapStep['type'], React.ComponentType<{ className?: string }>> = {
  video: Play,
  reading: BookOpen,
  quiz: HelpCircle,
  coding: Code,
  project: FolderGit2,
  reflection: PenLine,
};

const statusStyles = {
  completed: "text-success",
  active: "text-primary",
  locked: "text-muted-foreground/50",
};

const stepShortLabel: Record<RoadmapStep["type"], string> = {
  reading: "Learn",
  quiz: "Quiz",
  coding: "Problem Solving",
  video: "Video",
  project: "Project",
  reflection: "Reflection",
};

interface Props {
  phases: RoadmapPhase[];
  activeStepId: string;
  onSelectStep: (step: RoadmapStep) => void;
  loadingStepId?: string | null;
}

export default function SidebarRoadmap({ phases, activeStepId, onSelectStep, loadingStepId = null }: Props) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(phases.map(p => p.id))
  );

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const completedCount = phases.flatMap(p => p.steps).filter(s => s.status === "completed").length;
  const totalCount = phases.flatMap(p => p.steps).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <aside className="w-72 lg:w-80 shrink-0 hidden md:flex flex-col h-[calc(100vh-4rem)] glass-panel rounded-none border-t-0 border-l-0 border-b-0 overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold mb-2">Your Roadmap</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <span className="font-medium">{completedCount}/{totalCount}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {phases.map((phase) => {
          const expanded = expandedPhases.has(phase.id);
          const phaseCompleted = phase.steps.every(s => s.status === "completed");
          const groupedSteps = phase.steps.reduce<Array<{ topicKey: string; topicTitle: string; steps: RoadmapStep[] }>>((acc, step) => {
            const cd = (step.content_data ?? {}) as Record<string, unknown>;
            const topicKeyRaw = typeof cd.topic_key === "string" && cd.topic_key.trim() ? cd.topic_key : step.id;
            const topicTitleRaw =
              typeof cd.topic_title === "string" && cd.topic_title.trim()
                ? cd.topic_title
                : step.title.split(" - ")[0];
            const prev = acc[acc.length - 1];
            if (prev && prev.topicKey === topicKeyRaw) {
              prev.steps.push(step);
            } else {
              acc.push({ topicKey: topicKeyRaw, topicTitle: topicTitleRaw, steps: [step] });
            }
            return acc;
          }, []);

          return (
            <div key={phase.id} className="mb-1">
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 text-left">{phase.title}</span>
                {phaseCompleted && <Check className="w-4 h-4 text-success" />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 border-l border-border pl-2 space-y-2">
                      {groupedSteps.map((group) => (
                        <div key={group.topicKey} className="space-y-0.5">
                          <div className="px-3 py-1 text-xs text-muted-foreground/90 font-medium truncate">
                            {group.topicTitle}
                          </div>
                          {group.steps.map((step) => {
                            const Icon = typeIcons[step.type];
                            const isActive = step.id === activeStepId;
                            return (
                              <button
                                key={step.id}
                                onClick={() => onSelectStep(step)}
                                disabled={loadingStepId === step.id}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                                  isActive
                                    ? "bg-primary/15 text-primary"
                                    : step.status === "completed"
                                    ? "text-muted-foreground hover:bg-secondary cursor-pointer"
                                    : "text-foreground hover:bg-secondary cursor-pointer"
                                }`}
                              >
                                {loadingStepId === step.id ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                                ) : step.status === "completed" ? (
                                  <Check className="w-4 h-4 text-success shrink-0" />
                                ) : step.status === "locked" ? (
                                  <Lock className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <Icon className={`w-4 h-4 shrink-0 ${statusStyles[step.status]}`} />
                                )}
                                <span className="truncate text-left flex-1">{stepShortLabel[step.type] ?? step.title}</span>
                                <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                  {step.duration}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
