import Navbar from "@/components/Navbar";
import { projectSuggestions, badges as mockBadges } from "@/data/mockData";
import { QUERY_KEYS, useBadges, useProjects, useRoadmap } from "@/services/queries";
import { motion } from "framer-motion";
import { ExternalLink, Clock, CheckCircle2, Star, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const difficultyColors: Record<string, string> = {
  Beginner: "text-success bg-success/10",
  Intermediate: "text-warning bg-warning/10",
  Advanced: "text-destructive bg-destructive/10",
};

export default function Projects() {
  const { data: apiProjects, isFetching } = useProjects();
  const { data: apiBadges } = useBadges();
  const { data: roadmap } = useRoadmap();
  const qc = useQueryClient();

  // Use API data if available, fall back to mock data
  const projects = apiProjects?.length ? apiProjects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty,
    estimatedHours: p.estimated_hours,
    skills: p.skills_used,
    completed: p.completed,
  })) : projectSuggestions;
  const liveDomain = roadmap?.domain || "your roadmap domain";

  const badges = apiBadges?.length ? apiBadges.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    unlocked: b.unlocked,
  })) : mockBadges;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 md:pb-8 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects & Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time project suggestions for <span className="font-semibold text-foreground">{liveDomain}</span></p>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Suggested Projects</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => qc.invalidateQueries({ queryKey: QUERY_KEYS.projects })}
              disabled={isFetching}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 hover-lift flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColors[project.difficulty] ?? "text-muted-foreground bg-secondary"}`}>
                      {project.difficulty}
                    </span>
                    {i === 0 && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/15 text-primary inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Best Now
                      </span>
                    )}
                  </div>
                  {project.completed && <CheckCircle2 className="w-5 h-5 text-success" />}
                </div>
                <h3 className="text-base font-semibold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.skills.map((skill) => (
                    <span key={skill} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {project.estimatedHours} hrs
                  </span>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {project.completed ? "View" : "Start"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`glass-panel p-4 text-center ${!badge.unlocked ? "opacity-40" : ""}`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-xs font-semibold">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                {badge.unlocked && (
                  <Star className="w-3 h-3 text-warning mx-auto mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
