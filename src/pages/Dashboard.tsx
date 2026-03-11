import { useEffect, useState } from "react";
import type { RoadmapStep, RoadmapPhase } from "@/data/mockData";
import type { RoadmapPhase as ApiPhase } from "@/types/api";
import { useGenerateTopicContent, useRoadmap } from "@/services/queries";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SidebarRoadmap from "@/components/SidebarRoadmap";
import WorkspaceContainer from "@/components/WorkspaceContainer";
import AIMentorPanel from "@/components/AIMentorPanel";
import { Briefcase, X } from "lucide-react";

// ─── Adapter: API roadmap → local display types ───────────────────────────────
function adaptPhases(phases: ApiPhase[]): RoadmapPhase[] {
  return phases.map((p) => ({
    id: p.id,
    title: p.title,
    steps: p.steps.map((s) => {
      const mins = s.duration_minutes ?? 30;
      const duration = mins >= 60 ? `${(mins / 60).toFixed(0)} hr` : `${mins} min`;
      return {
        id: s.id,
        title: s.title,
        type: s.step_type as RoadmapStep['type'],
        status: s.status as RoadmapStep['status'],
        description: s.description,
        duration,
        content_data: s.content_data ?? null,
        resources: s.resources ?? [],
      } satisfies RoadmapStep;
    }),
  }));
}

export default function Dashboard() {
  const { data: roadmap, isLoading, isError, error } = useRoadmap();
  const generateTopicContent = useGenerateTopicContent();
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [loadingStepId, setLoadingStepId] = useState<string | null>(null);

  const phases: RoadmapPhase[] = roadmap?.phases?.length
    ? adaptPhases(roadmap.phases)
    : [];

  const activeDefault = phases
    .flatMap((p) => p.steps)
    .find((s) => s.status === "active") ?? null;

  const [activeStep, setActiveStep] = useState<RoadmapStep | null>(activeDefault);

  const resolvedActive =
    activeStep ??
    phases.flatMap((p) => p.steps).find((s) => s.status === "active") ??
    null;

  useEffect(() => {
    if (!activeStep) return;
    const fresh = phases.flatMap((p) => p.steps).find((s) => s.id === activeStep.id);
    if (fresh && fresh !== activeStep) setActiveStep(fresh);
  }, [phases, activeStep]);

  const isPlaceholderStep = (step: RoadmapStep) => {
    const cd = step.content_data as Record<string, unknown> | null;
    return !!cd && cd.is_placeholder === true;
  };

  const handleSelectStep = async (step: RoadmapStep) => {
    setActiveStep(step);
    if (!isPlaceholderStep(step)) {
      generateTopicContent.mutate(step.id);
      return;
    }
    setLoadingStepId(step.id);
    try {
      await generateTopicContent.mutateAsync(step.id);
      setActiveStep(step);
    } finally {
      setLoadingStepId(null);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading your roadmap…</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const isAiError =
      msg.toLowerCase().includes("ai") ||
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("503");
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16 px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-4xl">{isAiError ? "⚠️" : "❌"}</div>
            <h2 className="text-lg font-semibold">
              {isAiError ? "AI service temporarily unavailable" : "Failed to load roadmap"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAiError
                ? "The AI provider is currently rate-limited. Please wait a moment and try again."
                : msg}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── No roadmap yet ────────────────────────────────────────────────────────
  if (!phases.length) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16 px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-5xl">🚀</div>
            <h2 className="text-xl font-semibold">No personalized roadmap yet</h2>
            <p className="text-sm text-muted-foreground">
              Complete the diagnosis to generate your AI-powered learning roadmap
              tailored to your skills and goals.
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Start Diagnosis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Roadmap loaded ────────────────────────────────────────────────────────
  const completionPct = roadmap && roadmap.total_steps > 0
    ? Math.round((roadmap.completed_steps / roadmap.total_steps) * 100)
    : 0;
  const showInternshipBanner = completionPct >= 50 && !bannerDismissed;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {showInternshipBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary/90 to-accent/90 text-primary-foreground px-4 py-2.5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>
              🎓 You're <strong>{completionPct}%</strong> through your roadmap —
            </span>
            <Link
              to="/internships"
              className="underline font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Explore Internship Opportunities →
            </Link>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 rounded hover:bg-white/20 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div
        className={`flex pb-16 md:pb-0 ${showInternshipBanner ? "pt-24" : "pt-16"}`}
        style={{ height: "100vh" }}
      >
        <SidebarRoadmap
          phases={phases}
          activeStepId={resolvedActive?.id ?? ""}
          onSelectStep={handleSelectStep}
          loadingStepId={loadingStepId}
        />
        <WorkspaceContainer
          step={resolvedActive}
          allPhases={phases}
          onStepComplete={setActiveStep}
        />
        <AIMentorPanel />
      </div>
    </div>
  );
}
