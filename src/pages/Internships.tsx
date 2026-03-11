import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, ExternalLink, RefreshCw, MapPin, Clock,
  DollarSign, Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useInternshipRecommendations } from "@/services/queries";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/services/queries";
import type { InternshipRecommendation } from "@/types/api";

// ─── Platform icon map ────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "bg-[#0A66C2]",
  indeed: "bg-[#003A9B]",
  internshala: "bg-[#2CB5E8]",
  wellfound: "bg-[#000000]",
  unstop: "bg-[#6C2BD9]",
  naukri: "bg-[#FF7555]",
  glassdoor: "bg-[#0CAA41]",
  simplyhired: "bg-[#FF0000]",
};

function platformColor(platform: string): string {
  const key = platform.toLowerCase().replace(/\s+/g, "");
  return PLATFORM_COLORS[key] ?? "bg-primary";
}

function platformInitials(platform: string): string {
  return platform.slice(0, 2).toUpperCase();
}

// ─── Skill chip ───────────────────────────────────────────────────────────────
function SkillChip({ skill }: { skill: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {skill}
    </span>
  );
}

// ─── Recommendation card ──────────────────────────────────────────────────────
function RecommendationCard({ item, index }: { item: InternshipRecommendation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-panel rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${platformColor(item.platform)}`}
        >
          {platformInitials(item.platform)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            {item.platform}
          </p>
          <h3 className="text-sm font-semibold text-foreground leading-snug">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {item.duration}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> {item.location}
        </span>
        {item.stipend_range && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> {item.stipend_range}
          </span>
        )}
      </div>

      {/* Skills */}
      {item.skills_needed.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.skills_needed.map((s) => (
            <SkillChip key={s} skill={s} />
          ))}
        </div>
      )}

      {/* Apply button */}
      <a
        href={item.apply_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Find Internships <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </motion.div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 rounded bg-secondary" />
          <div className="h-4 w-3/4 rounded bg-secondary" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-secondary" />
        <div className="h-3 w-4/5 rounded bg-secondary" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-secondary" />
        <div className="h-5 w-24 rounded-full bg-secondary" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-secondary" />
        <div className="h-5 w-16 rounded-full bg-secondary" />
        <div className="h-5 w-12 rounded-full bg-secondary" />
      </div>
      <div className="mt-auto h-9 rounded-lg bg-secondary" />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Internships() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useInternshipRecommendations();
  const qc = useQueryClient();
  const [lastRefresh, setLastRefresh] = useState(0);

  const handleRefresh = () => {
    const now = Date.now();
    if (now - lastRefresh < 30_000) return; // 30-second debounce
    setLastRefresh(now);
    qc.removeQueries({ queryKey: QUERY_KEYS.internshipRecommendations });
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pb-8 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Internship Finder</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-curated internship opportunities matched to your domain and skills
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isFetching || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-lg font-semibold">Could not load recommendations</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "An unexpected error occurred."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Cards — always shown when data is ready */}
        {!isLoading && data && (
          <>
            {/* Domain badge */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Showing results for{" "}
                <span className="font-semibold text-foreground">{data.domain}</span>
                {" "}·{" "}
                <span className="font-semibold text-foreground">{data.level}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recommendations.map((item, i) => (
                <RecommendationCard key={`${item.platform}-${i}`} item={item} index={i} />
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Links open pre-filtered searches on each platform — results update in real time.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
