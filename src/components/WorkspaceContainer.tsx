import {
  Play, BookOpen, HelpCircle, Code, FolderGit2, PenLine, Video,
  CheckCircle2, XCircle, ArrowRight, Loader2, ExternalLink, Globe,
  Search, ChevronDown, ChevronRight, AlertTriangle, Trophy,
} from "lucide-react";
import { type RoadmapStep, type RoadmapPhase } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitStep, useVideoRecommendation } from "@/services/queries";
import type { StepSubmitResponse, QuizQuestionResult, ChallengeResult } from "@/types/api";

const LANGUAGES = [
  { code: "en",    label: "English"    },
  { code: "hi",    label: "Hindi"      },
  { code: "ta",    label: "Tamil"      },
  { code: "te",    label: "Telugu"     },
  { code: "es",    label: "Spanish"    },
  { code: "fr",    label: "French"     },
  { code: "de",    label: "German"     },
  { code: "pt",    label: "Portuguese" },
  { code: "ja",    label: "Japanese"   },
  { code: "ko",    label: "Korean"     },
  { code: "zh-CN", label: "Chinese"    },
];
const VIDEO_LANG_STORAGE_KEY = "career_ai_video_lang";

function buildYTSearchUrl(query: string, langCode: string) {
  const lang = LANGUAGES.find(l => l.code === langCode);
  const q = encodeURIComponent(`${query} tutorial ${lang?.label !== "English" ? lang?.label ?? "" : ""}`.trim());
  return `https://www.youtube.com/results?search_query=${q}&sp=EgIQAQ%253D%253D`;
}

function asArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function asStr(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function getInitialVideoLang(): string {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(VIDEO_LANG_STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {}
  return "en";
}

const typeConfig: Record<RoadmapStep["type"], { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  video:      { icon: Video,      label: "Video Lesson",     color: "text-primary" },
  reading:    { icon: BookOpen,   label: "Reading Material", color: "text-accent" },
  quiz:       { icon: HelpCircle, label: "Quiz",             color: "text-warning" },
  coding:     { icon: Code,       label: "Coding Challenge", color: "text-success" },
  project:    { icon: FolderGit2, label: "Mini Project",     color: "text-primary" },
  reflection: { icon: PenLine,    label: "Reflection",       color: "text-accent" },
};

function LanguageSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showMore, setShowMore] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === value) ?? LANGUAGES[0];
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setShowMore(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        <Globe className="w-3.5 h-3.5" /> Language:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.slice(0, 5).map(lang => (
          <button key={lang.code} onClick={() => onChange(lang.code)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${value === lang.code ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >{lang.label}</button>
        ))}
        <div className="relative" ref={ref}>
          <button onClick={() => setShowMore(v => !v)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1 ${LANGUAGES.slice(5).some(l => l.code === value) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >
            {LANGUAGES.slice(5).some(l => l.code === value) ? current.label : "More"}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showMore && (
            <div className="absolute top-full mt-1 left-0 z-20 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
              {LANGUAGES.slice(5).map(lang => (
                <button key={lang.code} onClick={() => { onChange(lang.code); setShowMore(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors ${value === lang.code ? "text-primary font-semibold" : "text-foreground"}`}
                >{lang.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopicVideoPanel({ step }: { step: RoadmapStep }) {
  const cd = step.content_data ?? {};
  const searchQuery = asStr(
    (cd.video_search_query ?? cd.search_query ?? cd.topic_title ?? cd.title) as unknown,
    step.title
  );
  const keyPoints = asArr(cd.key_points ?? cd.notes ?? cd.key_concepts);
  const [lang, setLang] = useState(getInitialVideoLang);
  const [playing, setPlaying] = useState(false);
  const { data: vid, isLoading, isError } = useVideoRecommendation(step.id, lang);
  const ytSearchUrl = buildYTSearchUrl(searchQuery, lang);
  const currentLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];
  useEffect(() => {
    try { localStorage.setItem(VIDEO_LANG_STORAGE_KEY, lang); } catch {}
  }, [lang]);
  useEffect(() => { setPlaying(false); }, [lang]);
  return (
    <div className="space-y-5">
      <LanguageSelector value={lang} onChange={setLang} />
      <div className="aspect-video rounded-xl bg-secondary overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Finding the best {currentLang.label} video...</p>
          </div>
        )}
        {!isLoading && !isError && vid?.found && !playing && (
          <div className="relative w-full h-full cursor-pointer group" onClick={() => setPlaying(true)}>
            {vid.thumbnail_url ? (
              <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                <Play className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                <Play className="w-7 h-7 text-white fill-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm font-medium line-clamp-2">{vid.title}</p>
              <p className="text-white/70 text-xs mt-0.5">{vid.channel_name}{vid.view_count ? ` - ${vid.view_count} views` : ""}{vid.duration ? ` - ${vid.duration}` : ""}</p>
            </div>
          </div>
        )}
        {!isLoading && !isError && vid?.found && playing && vid.video_id && (
          <iframe key={`${vid.video_id}-${lang}`}
            src={`https://www.youtube.com/embed/${vid.video_id}?autoplay=1&hl=${lang}`}
            className="w-full h-full" allowFullScreen title={vid.title}
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
        {!isLoading && (!vid?.found || isError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm">Search YouTube for &ldquo;<strong>{searchQuery}</strong>&rdquo; in <strong>{currentLang.label}</strong></p>
            <a href={ytSearchUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
              <Search className="w-4 h-4" />Search YouTube<ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {vid?.found && vid.video_id && (
          <a href={`https://www.youtube.com/watch?v=${vid.video_id}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors border border-border">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />Watch on YouTube
          </a>
        )}
        <a href={ytSearchUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground hover:bg-secondary/80 transition-colors border border-border">
          <Search className="w-3.5 h-3.5" />More {currentLang.label} videos<ExternalLink className="w-3 h-3" />
        </a>
      </div>
      {keyPoints.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-2">What you will learn</h3>
          <ul className="space-y-1.5">
            {keyPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5">*</span>{pt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function VideoContent({ step }: { step: RoadmapStep }) {
  return <TopicVideoPanel step={step} />;
}

function ReadingContent({ step }: { step: RoadmapStep }) {
  const cd = step.content_data ?? {};
  const concepts = asArr(cd.key_concepts);
  const material = asStr(cd.reading_material as unknown, step.description);
  return (
    <div className="space-y-5">
      {concepts.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-3">Key Concepts</h3>
          <div className="space-y-2">
            {concepts.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {material && (
        <div>
          <h3 className="text-base font-semibold mb-2">Study Guide</h3>
          <div className="p-4 rounded-xl bg-secondary/30 text-sm text-foreground leading-relaxed whitespace-pre-wrap">{material}</div>
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold mb-2">Video Lesson</h3>
        <TopicVideoPanel step={step} />
      </div>
    </div>
  );
}

interface MCQ { id: string; question: string; options: string[]; correct_answer?: string; explanation?: string; }

function QuizContent({ step, answersMap, onAnswersChange, results }: {
  step: RoadmapStep; answersMap: Record<string, string>;
  onAnswersChange: (m: Record<string, string>) => void;
  results?: QuizQuestionResult[] | null;
}) {
  const cd = step.content_data ?? {};
  const rawQuestions = Array.isArray(cd.questions) ? cd.questions as MCQ[] : [];
  const questions: MCQ[] = rawQuestions.map((q, i) => ({
    id: q.id ?? `q${i}`, question: asStr(q.question as unknown, `Question ${i + 1}`),
    options: Array.isArray(q.options) ? q.options as string[] : [],
    correct_answer: q.correct_answer, explanation: q.explanation,
  }));
  const answered = Object.keys(answersMap).length;
  const total = questions.length;
  const resultMap: Record<string, QuizQuestionResult> = {};
  results?.forEach(r => { resultMap[r.question_id] = r; });
  const hasResults = !!(results && results.length > 0);

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">{step.description}</p>
        <textarea className="w-full h-32 p-4 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Write your answer..."
          value={answersMap["__text__"] ?? ""} onChange={e => onAnswersChange({ "__text__": e.target.value })} />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {!hasResults && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{answered}/{total} answered</span>
          <div className="flex-1 mx-3 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }} />
          </div>
          <span className={answered === total ? "text-success font-medium" : ""}>{answered === total ? "All answered" : `${total - answered} remaining`}</span>
        </div>
      )}
      {hasResults && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <Trophy className="w-5 h-5 text-warning shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-foreground">{results!.filter(r => r.correct).length}/{results!.length}</span>
            <span className="text-muted-foreground"> correct</span>
          </div>
        </div>
      )}
      {questions.map((q, qi) => {
        const selected = answersMap[q.id];
        const qResult = resultMap[q.id];
        return (
          <div key={q.id} className="space-y-3">
            <div className="flex items-start gap-2">
              {hasResults && qResult && (qResult.correct
                ? <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />)}
              <p className="font-medium text-sm">{qi + 1}. {q.question}</p>
            </div>
            <div className="space-y-2 pl-1">
              {q.options.map((opt, oi) => {
                const letter = String.fromCharCode(65 + oi);
                const isSelected = selected === letter || selected === opt;
                const isCorrect = hasResults && qResult && (qResult.correct_answer === letter || opt === qResult.correct_answer_text);
                const isWrong = hasResults && qResult && isSelected && !qResult.correct;
                return (
                  <button key={oi} disabled={hasResults}
                    onClick={() => onAnswersChange({ ...answersMap, [q.id]: letter })}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                      hasResults
                        ? isCorrect ? "border-success bg-success/10 text-success"
                          : isWrong ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border text-muted-foreground opacity-60"
                        : isSelected ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"}`}>
                    <span className="font-mono mr-2 text-xs opacity-70">{letter}.</span>{opt}
                    {hasResults && isCorrect && <span className="ml-2 text-xs font-medium">(correct)</span>}
                  </button>
                );
              })}
            </div>
            {hasResults && qResult?.explanation && (
              <div className="ml-1 p-3 rounded-lg bg-secondary/50 border-l-2 border-primary/30 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Explanation: </span>{qResult.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface Challenge { id: string; title: string; problem: string; starter_code?: string; expected_output?: string; hint?: string; }

function CodingContent({ step, codeMap, onCodeChange, results }: {
  step: RoadmapStep; codeMap: Record<string, string>;
  onCodeChange: (m: Record<string, string>) => void;
  results?: ChallengeResult[] | null;
}) {
  const cd = step.content_data ?? {};
  const rawChallenges = Array.isArray(cd.challenges) ? cd.challenges as Challenge[] : [];
  const [openId, setOpenId] = useState<string | null>(null);
  const challenges: Challenge[] = rawChallenges.map((c, i) => ({
    id: c.id ?? `c${i}`, title: asStr(c.title as unknown, `Challenge ${i + 1}`),
    problem: asStr((c.problem ?? (c as Record<string, unknown>).challenge_description ?? (c as Record<string, unknown>).description) as unknown, ""),
    starter_code: asStr(c.starter_code as unknown),
    expected_output: asStr(c.expected_output as unknown),
    hint: asStr(c.hint as unknown),
  }));
  const resultMap: Record<string, ChallengeResult> = {};
  results?.forEach(r => { resultMap[r.id] = r; });
  const hasResults = !!(results && results.length > 0);
  const solved = hasResults ? results!.filter(r => r.passed).length : challenges.filter(c => !!(codeMap[c.id]?.trim())).length;

  if (challenges.length === 0) {
    const challenge = asStr((cd.challenge_description ?? cd.challenge ?? cd.problem) as unknown, step.description);
    const starterCode = asStr((cd.starter_code ?? cd.template) as unknown);
    return (
      <div className="space-y-4">
        <div><h3 className="text-base font-semibold mb-2">Challenge</h3><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{challenge}</p></div>
        {starterCode && (<div className="rounded-xl bg-background p-4 font-mono text-sm border border-border"><pre className="text-muted-foreground whitespace-pre-wrap">{starterCode}</pre></div>)}
        <textarea className="w-full h-40 p-4 rounded-xl bg-background border border-border text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Write your solution here..." value={codeMap["__code__"] ?? ""} onChange={e => onCodeChange({ "__code__": e.target.value })} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{hasResults ? `${results!.filter(r => r.passed).length} / ${results!.length} passed` : `${solved} / ${challenges.length} attempted`}</span>
        <div className="flex-1 mx-3 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-success transition-all duration-300" style={{ width: `${challenges.length > 0 ? (solved / challenges.length) * 100 : 0}%` }} />
        </div>
        <span className={hasResults && solved === challenges.length ? "text-success font-medium" : ""}>{hasResults && solved === challenges.length ? "All passed" : ""}</span>
      </div>
      {challenges.map((c) => {
        const isOpen = openId === c.id;
        const res = resultMap[c.id];
        const hasCode = !!(codeMap[c.id]?.trim());
        return (
          <div key={c.id} className="rounded-xl border border-border overflow-hidden">
            <button onClick={() => setOpenId(isOpen ? null : c.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors">
              {hasResults
                ? (res?.passed ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <XCircle className="w-4 h-4 text-destructive shrink-0" />)
                : hasCode ? <div className="w-4 h-4 rounded-full bg-primary/30 shrink-0" />
                : <div className="w-4 h-4 rounded-full border border-border shrink-0" />}
              <span className="text-sm font-medium flex-1">{c.title}</span>
              {hasResults && res && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${res.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{res.score}/100</span>
              )}
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="p-4 pt-0 space-y-3 border-t border-border">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{c.problem}</p>
                    {c.starter_code && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Starter code</p>
                        <pre className="text-xs p-3 rounded-lg bg-background border border-border font-mono whitespace-pre-wrap text-muted-foreground overflow-x-auto">{c.starter_code}</pre>
                      </div>
                    )}
                    {c.expected_output && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Expected output</p>
                        <pre className="text-xs p-3 rounded-lg bg-success/5 border border-success/20 font-mono text-success overflow-x-auto">{c.expected_output}</pre>
                      </div>
                    )}
                    {c.hint && (<details className="text-xs"><summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">Hint</summary><p className="mt-1 pl-2 text-muted-foreground">{c.hint}</p></details>)}
                    <textarea className="w-full h-36 p-3 rounded-xl bg-background border border-border text-xs font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Write your solution here..."
                      value={codeMap[c.id] ?? c.starter_code ?? ""} onChange={e => onCodeChange({ ...codeMap, [c.id]: e.target.value })} disabled={hasResults} />
                    {hasResults && res && (
                      <div className={`p-3 rounded-lg text-xs space-y-1.5 ${res.passed ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}>
                        <p className={`font-semibold ${res.passed ? "text-success" : "text-destructive"}`}>{res.passed ? "Passed" : "Failed"}</p>
                        {res.feedback && <p className="text-muted-foreground">{res.feedback}</p>}
                        {!res.passed && res.correct_code && (
                          <details><summary className="cursor-pointer font-medium text-foreground">Show solution</summary>
                            <pre className="mt-1 p-2 rounded bg-background font-mono whitespace-pre-wrap overflow-x-auto">{res.correct_code}</pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ProjectContent({ step, answer, onChange }: { step: RoadmapStep; answer: string; onChange: (v: string) => void }) {
  const cd = step.content_data ?? {};
  const brief = asStr((cd.brief ?? cd.description) as unknown, step.description);
  const requirements = asArr(cd.requirements ?? cd.tasks);
  return (
    <div className="space-y-4">
      <div><h3 className="text-base font-semibold mb-2">Project Brief</h3><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{brief}</p></div>
      {requirements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Requirements</h3>
          <ul className="space-y-1.5">
            {requirements.map((r, i) => (<li key={i} className="flex items-start gap-2 text-sm"><span className="text-primary font-bold mt-0.5">+</span>{r}</li>))}
          </ul>
        </div>
      )}
      <textarea className="w-full h-40 p-4 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="Paste your project link or describe your approach..." value={answer} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function ReflectionContent({ step, answer, onChange }: { step: RoadmapStep; answer: string; onChange: (v: string) => void }) {
  const cd = step.content_data ?? {};
  const prompt = asStr((cd.prompt ?? (cd as Record<string, unknown>).reflection_prompt ?? cd.question) as unknown, step.description);
  const points = asArr((cd as Record<string, unknown>).guiding_questions ?? (cd as Record<string, unknown>).points);
  return (
    <div className="space-y-4">
      <div><h3 className="text-base font-semibold mb-2">Reflection Prompt</h3><p className="text-sm text-foreground leading-relaxed">{prompt}</p></div>
      {points.length > 0 && (
        <ul className="space-y-1.5 pl-1">
          {points.map((p, i) => (<li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-accent">-&gt;</span>{p}</li>))}
        </ul>
      )}
      <textarea className="w-full h-40 p-4 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="Write your reflection..." value={answer} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

interface Props {
  step: RoadmapStep | null;
  allPhases?: RoadmapPhase[];
  onStepComplete?: (next: RoadmapStep) => void;
}

export default function WorkspaceContainer({ step, allPhases = [], onStepComplete }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [result, setResult] = useState<StepSubmitResponse | null>(null);
  const submitStep = useSubmitStep();

  useEffect(() => {
    setSubmitted(false); setAnswer(""); setAnswersMap({}); setCodeMap({}); setResult(null);
  }, [step?.id]);

  function findNextStep(): RoadmapStep | null {
    if (!step || allPhases.length === 0) return null;
    const allSteps = allPhases.flatMap(p => p.steps);
    const idx = allSteps.findIndex(s => s.id === step.id);
    if (idx === -1) return null;
    for (let i = idx + 1; i < allSteps.length; i++) {
      if (allSteps[i].status !== "completed") return allSteps[i];
    }
    return null;
  }

  function buildContent(): Record<string, unknown> {
    if (!step) return {};
    if (step.type === "quiz") {
      if (answersMap["__text__"] !== undefined) return { answer: answersMap["__text__"], text: answersMap["__text__"] };
      return { answers: answersMap };
    }
    if (step.type === "coding") {
      if (codeMap["__code__"] !== undefined) return { code: codeMap["__code__"], text: codeMap["__code__"] };
      return { challenges: codeMap };
    }
    return { answer, text: answer };
  }

  const handleSubmit = async () => {
    if (!step) return;
    try {
      const res = await submitStep.mutateAsync({ stepId: step.id, submission_type: step.type, content: buildContent(), time_spent_seconds: 0 });
      setResult(res); setSubmitted(true);
    } catch { setSubmitted(true); }
  };

  const handleContinue = () => {
    const next = findNextStep();
    if (next && onStepComplete) onStepComplete(next);
  };

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><BookOpen className="w-8 h-8 text-primary" /></div>
          <h2 className="text-xl font-semibold">Select a step to begin</h2>
          <p className="text-muted-foreground text-sm">Choose any step from the roadmap on the left to start learning.</p>
        </div>
      </div>
    );
  }

  const stepContent = (step.content_data ?? {}) as Record<string, unknown>;
  const isPlaceholder = stepContent.is_placeholder === true;

  if (isPlaceholder) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <h2 className="text-lg font-semibold">Generating topic content...</h2>
          <p className="text-sm text-muted-foreground">
            We are preparing written notes, docs, quiz, and coding practice for this topic.
          </p>
        </div>
      </div>
    );
  }

  const config = typeConfig[step.type];
  const Icon = config.icon;
  const cd = (step.content_data ?? {}) as Record<string, unknown>;
  const topicTitle = asStr(cd.topic_title as unknown, step.title.split(" - ")[0] || step.title);
  const stepLabel =
    step.type === "reading" ? "Learn" :
    step.type === "quiz" ? "Quiz" :
    step.type === "coding" ? "Problem Solving" :
    config.label;
  const resources = step.resources ?? [];
  const quizItems = result?.feedback?.items as QuizQuestionResult[] | undefined;
  const challengeResults = result?.feedback?.challenge_results as ChallengeResult[] | undefined;
  const passed = result?.passed ?? false;
  const nextStep = findNextStep();

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <motion.div key={step.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary ${config.color}`}>
              <Icon className="w-3.5 h-3.5" />{stepLabel}
            </span>
            <span className="text-xs text-muted-foreground">{step.duration}</span>
            {submitted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{topicTitle}</h1>
          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
        </div>

        <div className="glass-panel p-6 space-y-4">
          {step.type === "reading"    && <ReadingContent step={step} />}
          {step.type === "video"      && <VideoContent step={step} />}
          {step.type === "quiz"       && <QuizContent step={step} answersMap={answersMap} onAnswersChange={setAnswersMap} results={submitted ? quizItems ?? null : null} />}
          {step.type === "coding"     && <CodingContent step={step} codeMap={codeMap} onCodeChange={setCodeMap} results={submitted ? challengeResults ?? null : null} />}
          {step.type === "project"    && <ProjectContent step={step} answer={answer} onChange={setAnswer} />}
          {step.type === "reflection" && <ReflectionContent step={step} answer={answer} onChange={setAnswer} />}
        </div>

        {resources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resources</h3>
            <div className="flex flex-wrap gap-2">
              {resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors">
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />{r.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {!submitted ? (
          <Button onClick={handleSubmit} disabled={submitStep.isPending}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-sm">
            {submitStep.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</>
              : step.type === "quiz"    ? <>Submit Quiz <ArrowRight className="w-4 h-4 ml-2" /></>
              : step.type === "coding"  ? <>Submit All Solutions <ArrowRight className="w-4 h-4 ml-2" /></>
              : step.type === "video"   ? <>Mark as Watched <ArrowRight className="w-4 h-4 ml-2" /></>
              : step.type === "reading" ? <>Mark as Read <ArrowRight className="w-4 h-4 ml-2" /></>
              :                           <>Submit <ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-3">
              {(passed || step.type === "video" || step.type === "reading") ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">
                    {(step.type === "quiz" || step.type === "coding") ? `Passed! Score: ${result?.score ?? "..."}/100` : "Completed!"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Score: {result?.score ?? "..."}/100 - Keep practicing!</span>
                </div>
              )}
            </div>
            {result?.feedback?.summary && typeof result.feedback.summary === "string" && (
              <p className="text-sm text-muted-foreground">{result.feedback.summary}</p>
            )}
            {result?.feedback?.ai_feedback && typeof result.feedback.ai_feedback === "string" && (
              <p className="text-sm text-muted-foreground"><strong className="text-foreground">AI Feedback: </strong>{result.feedback.ai_feedback}</p>
            )}
            {result?.feedback?.suggestions && typeof result.feedback.suggestions === "string" && (
              <p className="text-xs text-muted-foreground italic">{result.feedback.suggestions}</p>
            )}
            {nextStep && onStepComplete ? (
              <Button onClick={handleContinue} className="w-full h-11 rounded-xl text-sm font-semibold">
                Continue: {nextStep.title} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center">All done! Select another step from the sidebar.</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
