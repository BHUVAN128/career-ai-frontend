import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain, Play, Clock, Target, MessageSquare, AlertTriangle,
  CheckCircle2, ArrowRight, RotateCcw, Briefcase, BookOpenCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAnswerInterview, useInterviewResult, useRoadmap, useStartInterview } from "@/services/queries";

type Mode = "technical" | "behavioral" | "situational";

const DOMAIN_TOPICS: Array<{ match: RegExp; topics: string[] }> = [
  {
    match: /mobile/i,
    topics: ["Android/iOS lifecycle", "State management", "Networking", "Offline storage", "App architecture", "Testing", "Performance", "CI/CD", "Release process", "Crash debugging"],
  },
  {
    match: /data|ml|ai/i,
    topics: ["Statistics", "Feature engineering", "Model evaluation", "Overfitting", "Experiment tracking", "Data cleaning", "Pipelines", "Deployment", "Monitoring", "Ethics"],
  },
  {
    match: /devops|cloud/i,
    topics: ["CI/CD pipelines", "Docker", "Kubernetes", "Infrastructure as code", "Monitoring", "Logging", "Incident response", "Cost optimization", "Security", "Scalability"],
  },
];

const DEFAULT_TOPICS = [
  "Core fundamentals", "System design basics", "Problem solving", "Testing strategy", "Debugging approach",
  "Communication", "Project architecture", "Performance tuning", "Security basics", "Version control",
];

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function deriveActionPlan(scores?: { technical_score: number; clarity_score: number; confidence_score: number; completeness_score: number; }) {
  if (!scores) return { strengths: [], improvements: [] };
  const entries = [
    ["Technical depth", scores.technical_score],
    ["Communication clarity", scores.clarity_score],
    ["Confidence", scores.confidence_score],
    ["Completeness", scores.completeness_score],
  ] as const;
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  return {
    strengths: sorted.slice(0, 3).map(([name]) => name),
    improvements: sorted.slice(-3).reverse().map(([name]) => name),
  };
}

export default function InterviewPrep() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: roadmap } = useRoadmap();
  const startInterview = useStartInterview();
  const answerInterview = useAnswerInterview();

  const defaultDomain = user?.profile?.domain || "Web Development";
  const defaultLevel = user?.profile?.level || "Intermediate";

  const [domain, setDomain] = useState(defaultDomain);
  const [level, setLevel] = useState(defaultLevel);
  const [mode, setMode] = useState<Mode>("technical");
  const [interviewId, setInterviewId] = useState("");
  const [question, setQuestion] = useState<{ id: string; question: string; type: string } | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answer, setAnswer] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [softWarn, setSoftWarn] = useState(false);

  const resultQuery = useInterviewResult(completed ? interviewId : "");

  useEffect(() => {
    setDomain(defaultDomain);
    setLevel(defaultLevel);
  }, [defaultDomain, defaultLevel]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsedSec((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!interviewId || !questionNumber) return;
    const k = `interview_draft:${interviewId}:${questionNumber}`;
    try {
      const draft = localStorage.getItem(k);
      if (draft) setAnswer(draft);
    } catch {}
  }, [interviewId, questionNumber]);

  useEffect(() => {
    if (!interviewId || !questionNumber) return;
    const k = `interview_draft:${interviewId}:${questionNumber}`;
    try { localStorage.setItem(k, answer); } catch {}
  }, [interviewId, questionNumber, answer]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!running || !answer.trim()) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [running, answer]);

  useEffect(() => {
    if (!resultQuery.data || !completed) return;
    try {
      localStorage.setItem("interview_last_result", JSON.stringify({
        overall_score: resultQuery.data.overall_score,
        domain,
        level,
        at: new Date().toISOString(),
      }));
    } catch {}
  }, [resultQuery.data, completed, domain, level]);

  const lastResult = useMemo(() => {
    try {
      const raw = localStorage.getItem("interview_last_result");
      return raw ? JSON.parse(raw) as { overall_score: number; domain: string; level: string; at: string } : null;
    } catch {
      return null;
    }
  }, [completed, resultQuery.data]);

  const weakRoadmapTopics = useMemo(() => {
    if (!roadmap?.phases?.length) return [];
    const topics: string[] = [];
    for (const phase of roadmap.phases) {
      for (const step of phase.steps) {
        const cd = step.content_data as Record<string, unknown> | null;
        const t = typeof cd?.topic_title === "string" ? cd.topic_title : step.title.split(" - ")[0];
        if (step.status !== "completed" && t && !topics.includes(t)) topics.push(t);
        if (topics.length >= 3) return topics;
      }
    }
    return topics;
  }, [roadmap]);

  const mustKnowTopics = useMemo(() => {
    const matched = DOMAIN_TOPICS.find((d) => d.match.test(domain));
    const base = matched?.topics ?? DEFAULT_TOPICS;
    const merged = [...base];
    for (const t of weakRoadmapTopics) if (!merged.includes(t)) merged.push(t);
    return merged.slice(0, 10);
  }, [domain, weakRoadmapTopics]);

  const progressPct = totalQuestions > 0 ? Math.round((questionNumber / totalQuestions) * 100) : 0;

  const onStart = async () => {
    try {
      const data = await startInterview.mutateAsync({ domain, level });
      setInterviewId(data.interview_id);
      setQuestion(data.question);
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      setAnswer("");
      setElapsedSec(0);
      setRunning(true);
      setCompleted(false);
      setSoftWarn(false);
    } catch {}
  };

  const onSubmitAnswer = async () => {
    if (!interviewId) return;
    const trimmed = answer.trim();
    if (trimmed.length < 25 && !softWarn) {
      setSoftWarn(true);
      return;
    }
    setSoftWarn(false);
    try {
      const data = await answerInterview.mutateAsync({ interviewId, answer: trimmed });
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      if (data.completed) {
        setRunning(false);
        setCompleted(true);
        setQuestion(null);
      } else {
        setQuestion(data.next_question);
        setAnswer("");
      }
    } catch {}
  };

  const onRetry = () => {
    setInterviewId("");
    setQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setAnswer("");
    setElapsedSec(0);
    setRunning(false);
    setCompleted(false);
    setSoftWarn(false);
  };

  const result = resultQuery.data;
  const plan = deriveActionPlan(result ? {
    technical_score: result.technical_score,
    clarity_score: result.clarity_score,
    confidence_score: result.confidence_score,
    completeness_score: result.completeness_score,
  } : undefined);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pb-8 px-4 md:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interview Preparation</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Prepare, practice, and improve for {domain} ({level})
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onStart} disabled={startInterview.isPending || running} className="gap-2">
              <Play className="w-4 h-4" /> Start Mock Interview
            </Button>
            <Button variant="outline" onClick={() => document.getElementById("prep-toolkit")?.scrollIntoView({ behavior: "smooth" })}>
              Quick Revision Checklist
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <section className="xl:col-span-3 glass-panel p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Prepare</h2>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Domain</label>
              <input value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Interview Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(["technical", "behavioral", "situational"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-lg border px-2 py-2 text-xs capitalize ${mode === m ? "bg-primary/15 border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">Mode is UI-only for now; backend runs mixed interview.</p>
            </div>
            {lastResult && (
              <div className="rounded-xl border border-border p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Last Interview</p>
                <p className="text-sm font-semibold">{lastResult.domain} · {lastResult.level}</p>
                <p className="text-xs">Overall Score: <span className="text-primary font-semibold">{lastResult.overall_score}/10</span></p>
              </div>
            )}
          </section>

          <section className="xl:col-span-6 glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Practice</h2>
              <div className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="font-semibold">{formatClock(elapsedSec)}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{questionNumber}/{totalQuestions || "-"} completed</p>

            {!running && !completed && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3">
                <Brain className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Ready for mock interview</h3>
                <p className="text-sm text-muted-foreground">Click Start Mock Interview to begin your timed session.</p>
              </div>
            )}

            {running && question && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="rounded-xl bg-secondary/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary capitalize">{question.type}</span>
                    <span className="text-xs text-muted-foreground">Question {questionNumber}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{question.question}</p>
                </div>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full min-h-44 rounded-xl bg-background border border-border p-4 text-sm resize-y"
                  placeholder="Type your answer here..."
                />
                {softWarn && (
                  <div className="text-xs text-warning flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Your answer is short. Click submit again to continue anyway.
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={onSubmitAnswer} disabled={answerInterview.isPending} className="gap-2">
                    {answerInterview.isPending ? "Submitting..." : "Submit & Next"} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {completed && (
              <div className="space-y-4">
                {!result && (
                  <div className="rounded-xl bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                    Scoring your interview...
                  </div>
                )}
                {result && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="rounded-xl bg-secondary/40 p-3"><p className="text-[11px] text-muted-foreground">Technical</p><p className="font-semibold">{result.technical_score}/10</p></div>
                      <div className="rounded-xl bg-secondary/40 p-3"><p className="text-[11px] text-muted-foreground">Clarity</p><p className="font-semibold">{result.clarity_score}/10</p></div>
                      <div className="rounded-xl bg-secondary/40 p-3"><p className="text-[11px] text-muted-foreground">Confidence</p><p className="font-semibold">{result.confidence_score}/10</p></div>
                      <div className="rounded-xl bg-secondary/40 p-3"><p className="text-[11px] text-muted-foreground">Completeness</p><p className="font-semibold">{result.completeness_score}/10</p></div>
                      <div className="rounded-xl bg-primary/15 p-3"><p className="text-[11px] text-muted-foreground">Overall</p><p className="font-semibold text-primary">{result.overall_score}/10</p></div>
                    </div>
                    <div className="rounded-xl bg-secondary/30 p-4 text-sm">{result.feedback}</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-border p-3">
                        <p className="font-semibold mb-2">Strengths</p>
                        <ul className="space-y-1 text-muted-foreground">
                          {plan.strengths.map((s) => <li key={s} className="flex gap-2 items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success" />{s}</li>)}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-border p-3">
                        <p className="font-semibold mb-2">Improvements</p>
                        <ul className="space-y-1 text-muted-foreground">
                          {plan.improvements.map((s) => <li key={s} className="flex gap-2 items-center"><Target className="w-3.5 h-3.5 text-warning" />{s}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border p-3 space-y-2">
                      <p className="font-semibold text-sm">Transcript</p>
                      {result.transcript.map((t, i) => (
                        <details key={i} className="rounded-lg bg-secondary/30 p-2">
                          <summary className="cursor-pointer text-sm">Q{i + 1}. {t.question}</summary>
                          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{t.answer}</p>
                        </details>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={onRetry} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Retry Interview</Button>
                      <Button onClick={() => navigate("/dashboard")} variant="outline" className="gap-2"><BookOpenCheck className="w-4 h-4" /> Back to Roadmap</Button>
                      <Button onClick={() => navigate("/internships")} className="gap-2"><Briefcase className="w-4 h-4" /> Find Internships</Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          <section id="prep-toolkit" className="xl:col-span-3 glass-panel p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Improve</h2>
            <div className="rounded-xl border border-border p-3">
              <p className="font-semibold text-sm mb-2">STAR Method</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><strong>S</strong>: Situation</li>
                <li><strong>T</strong>: Task</li>
                <li><strong>A</strong>: Action</li>
                <li><strong>R</strong>: Result (with numbers)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="font-semibold text-sm mb-2">Top 10 Must-Know Topics</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {mustKnowTopics.map((t) => (
                  <li key={t} className="flex items-start gap-2"><input type="checkbox" className="mt-0.5" /> <span>{t}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="font-semibold text-sm mb-2">Common Mistakes</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Answers too generic, no concrete examples</li>
                <li>No measurable impact in project stories</li>
                <li>Overlong answers without structure</li>
              </ul>
            </div>
            {weakRoadmapTopics.length > 0 && (
              <div className="rounded-xl border border-border p-3">
                <p className="font-semibold text-sm mb-2">Next Steps from Roadmap</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {weakRoadmapTopics.map((t) => <li key={t} className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-primary" />{t}</li>)}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

