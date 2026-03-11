import { useState, useRef, useEffect } from "react";
import { MessageSquare, BarChart3, Target, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSendMessage, useAnalyticsSummary, useWeeklyAnalytics } from "@/services/queries";
import type { ChatMessage as ApiChatMsg } from "@/types/api";

type Tab = "chat" | "performance" | "goals";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "chat", label: "Mentor", icon: MessageSquare },
  { id: "performance", label: "Skills", icon: BarChart3 },
  { id: "goals", label: "Goals", icon: Target },
];

function skillLabel(score: number): string {
  if (score >= 76) return "Advanced";
  if (score >= 51) return "Proficient";
  if (score >= 21) return "Developing";
  if (score > 0)  return "Beginner";
  return "Not started";
}

function skillColor(score: number): string {
  if (score >= 76) return "bg-success";
  if (score >= 51) return "bg-primary";
  if (score >= 21) return "bg-warning";
  if (score > 0)  return "bg-destructive/70";
  return "bg-border";
}

export default function AIMentorPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ApiChatMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendMessage();
  const { data: summary } = useAnalyticsSummary();
  const { data: weekly } = useWeeklyAnalytics();

  const skillScoresList = summary?.skills
    ? summary.skills.map((s) => ({ skill: s.skill, score: s.score }))
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;
    setInput('');

    const userMsg: ApiChatMsg = { id: Date.now().toString(), role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await sendMessage.mutateAsync({ message: text, sessionId });
      setSessionId(res.session_id);
      const aiMsg: ApiChatMsg = { id: res.reply?.id ?? Date.now().toString(), role: 'assistant', content: res.reply?.content ?? '', created_at: res.reply?.created_at ?? new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ApiChatMsg = { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="w-72 lg:w-80 shrink-0 hidden lg:flex flex-col h-[calc(100vh-4rem)] glass-panel rounded-none border-t-0 border-r-0 border-b-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin">
              <div className="text-center py-4">
                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">AI Mentor</p>
              </div>
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center px-2">
                  Ask me anything about your learning journey!
                </p>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm p-3 rounded-xl ${
                    msg.role === "user"
                      ? "bg-primary/10 text-foreground ml-6"
                      : "bg-secondary text-foreground mr-2"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}
              {sendMessage.isPending && (
                <div className="bg-secondary text-foreground mr-2 text-sm p-3 rounded-xl flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-muted-foreground">Thinking…</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your mentor..."
                  className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={sendMessage.isPending}
                />
                <button
                  onClick={handleSend}
                  disabled={sendMessage.isPending || !input.trim()}
                  className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {sendMessage.isPending
                    ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    : <Send className="w-4 h-4 text-primary-foreground" />
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Skill Levels</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Based on quiz & coding performance</p>
            </div>
            {skillScoresList.length === 0 ? (
              <p className="text-xs text-muted-foreground">Complete the skill assessment to see your scores.</p>
            ) : (
              <div className="space-y-3">
                {skillScoresList.map((skill) => (
                  <div key={skill.skill} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium capitalize">{skill.skill.replace(/_/g, ' ')}</span>
                      <span className={`font-medium ${
                        skill.score >= 76 ? "text-success"
                        : skill.score >= 51 ? "text-primary"
                        : skill.score >= 21 ? "text-warning"
                        : skill.score > 0  ? "text-destructive/80"
                        : "text-muted-foreground"
                      }`}>
                        {skill.score > 0 ? `${skill.score}% · ${skillLabel(skill.score)}` : "—"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${skillColor(skill.score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.score}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {skillScoresList.some((s) => s.score > 0 && s.score < 50) && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 mt-4">
                <p className="text-xs text-accent font-medium">Focus Suggestion</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Some skills are still developing. Complete more quiz and coding steps to improve.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "goals" && (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold">Weekly Goals</h3>
            {weekly ? (
              <div className="space-y-3">
                {/* Steps completed this week */}
                <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Steps completed</span>
                    {(weekly.summary?.steps_completed ?? 0) >= 3 && (
                      <span className="text-xs text-success font-medium">Done</span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-background overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (weekly.summary?.steps_completed ?? 0) >= 3 ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(((weekly.summary?.steps_completed ?? 0) / 3) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {weekly.summary?.steps_completed ?? 0} / 3 steps
                  </p>
                </div>

                {/* Accuracy this week */}
                {weekly.summary?.accuracy_percent != null && (
                  <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quiz accuracy</span>
                      {(weekly.summary.accuracy_percent ?? 0) >= 70 && (
                        <span className="text-xs text-success font-medium">On track</span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-background overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (weekly.summary.accuracy_percent ?? 0) >= 70 ? "bg-success" : "bg-warning"
                        }`}
                        style={{ width: `${Math.min(weekly.summary.accuracy_percent ?? 0, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {weekly.summary.accuracy_percent ?? 0}% accuracy this week
                    </p>
                  </div>
                )}

                {/* Total time studied */}
                {weekly.summary?.total_time_hours != null && (
                  <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Study time</span>
                      {(weekly.summary.total_time_hours ?? 0) >= 5 && (
                        <span className="text-xs text-success font-medium">Great!</span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-background overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(((weekly.summary.total_time_hours ?? 0) / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(weekly.summary.total_time_hours ?? 0).toFixed(1)}h this week
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Loading goals...</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
