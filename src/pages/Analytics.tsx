import Navbar from "@/components/Navbar";
import { weeklyData, skillScores } from "@/data/mockData";
import { useWeeklyAnalytics, useAnalyticsSummary } from "@/services/queries";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Flame, TrendingUp, Target, Clock } from "lucide-react";

export default function Analytics() {
  const { data: weekly } = useWeeklyAnalytics();
  const { data: summary } = useAnalyticsSummary();

  // Map API data → chart data; fall back to mock
  const chartData = weekly?.daily_data?.length
    ? weekly.daily_data.map((d) => ({ day: d.day, score: d.score, hours: d.hours }))
    : weeklyData;

  const skills = weekly?.skill_scores?.length
    ? weekly.skill_scores
    : skillScores;

  const radarData = skills.map((s) => ({ subject: s.skill, value: s.score, fullMark: 100 }));

  const completionRate = summary?.completion_rate ?? 0;
  const practiceAccuracy = summary?.practice_accuracy ?? 87;
  const totalMins = summary?.total_focus_minutes ?? 990;
  const streakCount = summary?.current_streak ?? 5;

  const stats = [
    { label: "Completion Rate", value: `${Math.round(completionRate * 100)}%`, icon: Target, color: "text-primary" },
    { label: "Practice Accuracy", value: `${Math.round(practiceAccuracy)}%`, icon: TrendingUp, color: "text-success" },
    { label: "Focus Time", value: `${(totalMins / 60).toFixed(1)} hr`, icon: Clock, color: "text-accent" },
    { label: "Current Streak", value: `${streakCount} days`, icon: Flame, color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 md:pb-8 px-4 md:px-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Your performance this week at a glance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6"
          >
            <h3 className="text-sm font-semibold mb-4">Skill Growth This Week</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                <XAxis dataKey="day" stroke="hsl(215 14% 65%)" fontSize={12} />
                <YAxis stroke="hsl(215 14% 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 40% 13%)",
                    border: "1px solid hsl(220 20% 18%)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(239 84% 67%)" strokeWidth={2.5} dot={{ fill: "hsl(239 84% 67%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6"
          >
            <h3 className="text-sm font-semibold mb-4">Skill Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220 20% 18%)" />
                <PolarAngleAxis dataKey="subject" stroke="hsl(215 14% 65%)" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar dataKey="value" stroke="hsl(188 86% 53%)" fill="hsl(188 86% 53%)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-6">
            <h3 className="text-sm font-semibold mb-2">📈 Weekly Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {`Keep pushing — you're making solid progress this week. Complete more steps to see your skill growth reflected here.`}
            </p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-sm font-semibold mb-2">🔥 Motivation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-warning font-medium">{streakCount}-day streak!</span>{' '}
              Keep going — you're building a consistent learning habit. Complete 1 more step today to maintain momentum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}