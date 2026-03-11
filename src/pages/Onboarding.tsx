import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Upload, FileText, ChevronRight, ChevronLeft, Check,
  Loader2, Target, Sparkles, SkipForward, AlertCircle,
} from 'lucide-react';
import { useUploadResume, useStartAssessment, useSubmitAssessment, useGenerateRoadmap } from '@/services/queries';
import type { AssessmentQuestion, DiagnosisResult } from '@/types/api';

const DOMAINS = [
  'Web Development', 'Data Science', 'Machine Learning', 'Mobile Development',
  'DevOps / Cloud', 'Cybersecurity', 'UI/UX Design', 'Backend Engineering',
];
const LEVELS = ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced'] as const;

// ─── Variants ────────────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

// ─── Step 1: Welcome ─────────────────────────────────────────────────────────
function WelcomeStep({
  onPickResume, onPickAssessment, onSkip,
}: {
  onPickResume: () => void;
  onPickAssessment: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-8 text-center">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Welcome to Career AI</h2>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Let's build your personalised learning roadmap. How would you like to get started?
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={onPickResume}
          className="group flex items-start gap-4 p-5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all text-left"
        >
          <div className="mt-0.5 p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Upload my resume</p>
            <p className="text-sm text-muted-foreground">AI analyses your experience and builds a tailored roadmap</p>
          </div>
          <ChevronRight className="ml-auto mt-2 w-4 h-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
        </button>

        <button
          onClick={onPickAssessment}
          className="group flex items-start gap-4 p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all text-left"
        >
          <div className="mt-0.5 p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Take a skill assessment</p>
            <p className="text-sm text-muted-foreground">Answer 9 adaptive questions to discover your skill level</p>
          </div>
          <ChevronRight className="ml-auto mt-2 w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
        </button>

        <button
          onClick={onSkip}
          className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/30 transition-all"
        >
          <SkipForward className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Skip for now — explore the platform</span>
        </button>
      </div>
    </div>
  );
}

// ─── Step 2A: Resume Upload ───────────────────────────────────────────────────
function ResumeStep({
  onBack, onComplete,
}: {
  onBack: () => void;
  onComplete: (text: string, detectedLevel: string, detectedDomain: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [err, setErr] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [insights, setInsights] = useState<DiagnosisResult | null>(null);
  const uploadResume = useUploadResume();

  const handleFile = async (file: File) => {
    setErr('');
    setFileName(file.name);
    setInsights(null);
    // Show image preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await uploadResume.mutateAsync(form);
      // Show insights first, let user click Continue
      setInsights(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleContinue = () => {
    if (!insights) return;
    onComplete(
      insights.summary || '',
      insights.detected_level || 'Beginner',
      insights.recommended_domain || 'Web Development',
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload your resume</h2>
        <p className="text-muted-foreground mt-1">PDF, DOCX, TXT or Image (JPG/PNG) · max 5 MB</p>
      </div>

      {!insights && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging ? 'border-purple-500 bg-purple-500/10' : 'border-border hover:border-purple-500/50 hover:bg-muted/20'
          }`}
        >
          <input type="file" accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp,image/*" className="hidden" onChange={onInputChange} />
          {uploadResume.isPending ? (
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          ) : imagePreview ? (
            <img src={imagePreview} alt="Resume preview" className="max-h-32 rounded-lg object-contain" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="font-medium text-foreground">{fileName || 'Drag & drop your resume here'}</p>
            <p className="text-sm text-muted-foreground">{uploadResume.isPending ? 'Analysing...' : fileName ? 'Click to change file' : 'or click to browse'}</p>
          </div>
        </label>
      )}

      {/* Insights after upload */}
      {insights && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5">
            <p className="text-sm font-semibold text-green-400 mb-1">Analysis complete!</p>
            <p className="text-sm text-muted-foreground">
              Detected level: <strong className="text-foreground">{insights.detected_level}</strong>
              {' · '}
              Recommended: <strong className="text-foreground">{insights.recommended_domain}</strong>
            </p>
          </div>

          {insights.weaknesses && insights.weaknesses.length > 0 && (
            <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
              <p className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Areas to improve</p>
              <ul className="space-y-1">
                {insights.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.available_domains && insights.available_domains.length > 0 && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-sm font-semibold text-blue-400 mb-2">Domains you can pursue</p>
              <div className="flex flex-wrap gap-2">
                {insights.available_domains.map((d, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-medium border border-blue-500/30">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Continue to assessment <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {err && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {err}
        </div>
      )}

      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
    </div>
  );
}
// ─── Step 2B: Manual Domain/Level ────────────────────────────────────────────
function ManualStep({
  onBack, onComplete,
}: {
  onBack: () => void;
  onComplete: (domain: string, level: string) => void;
}) {
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
        <p className="text-muted-foreground mt-1">We'll tailor your assessment accordingly</p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-3">What domain are you targeting?</p>
        <div className="grid grid-cols-2 gap-2">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={`p-3 rounded-lg border text-sm text-left transition-all ${
                domain === d
                  ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-medium'
                  : 'border-border hover:border-purple-500/40 text-muted-foreground'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-3">How would you rate your current level?</p>
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`p-3 rounded-lg border text-sm transition-all ${
                level === l
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-medium'
                  : 'border-border hover:border-blue-500/40 text-muted-foreground'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => domain && level && onComplete(domain, level)}
          disabled={!domain || !level}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Start assessment <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Assessment ───────────────────────────────────────────────────────
function AssessmentStep({
  questions, onBack, onComplete,
}: {
  questions: AssessmentQuestion[];
  onBack: () => void;
  onComplete: (answers: Record<string, string>) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const answer = (val: string) => {
    const updated = { ...answers, [q.id]: val };
    setAnswers(updated);
    if (!isLast) {
      setTimeout(() => setIdx((i) => i + 1), 300);
    } else {
      onComplete(updated);
    }
  };

  if (!q) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Skill Assessment</h2>
          <p className="text-muted-foreground mt-1">Question {idx + 1} of {questions.length}</p>
        </div>
        <span className="text-xs text-muted-foreground px-2 py-1 rounded-full border border-border">
          {q.type?.replace('_', ' ')}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          initial={false}
          animate={{ width: `${((idx + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <p className="text-foreground font-medium leading-relaxed">{q.question}</p>

          {q.options?.length ? (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(opt)}
                  className={`w-full text-left p-4 rounded-lg border text-sm transition-all ${
                    answers[q.id] === opt
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-border hover:border-purple-500/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={4}
                className="w-full p-3 rounded-lg bg-background/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                placeholder="Write your answer here…"
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              />
              <button
                onClick={() => answer(answers[q.id] ?? '')}
                disabled={!answers[q.id]?.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {isLast ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {idx > 0 && (
        <button onClick={() => setIdx((i) => i - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
      )}
    </div>
  );
}

// ─── Step 4: Results ──────────────────────────────────────────────────────────
function ResultsStep({
  skillMatrix, onDashboard,
}: {
  skillMatrix: Record<string, number>;
  onDashboard: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Your roadmap is ready!</h2>
        <p className="text-muted-foreground mt-2">Here's what we found about your skill levels</p>
      </div>

      <div className="space-y-3 text-left">
        {Object.entries(skillMatrix).slice(0, 6).map(([skill, score]) => (
          <div key={skill}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground font-medium capitalize">{skill.replace(/_/g, ' ')}</span>
              <span className="text-muted-foreground">{score}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onDashboard}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Go to Dashboard <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Onboarding ──────────────────────────────────────────────────────────
type Stage =
  | 'welcome'
  | 'resume'
  | 'manual'
  | 'assessment'
  | 'submitting'
  | 'results'
  | 'error';

export default function Onboarding() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('welcome');
  const [direction, setDirection] = useState(1);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [skillMatrix, setSkillMatrix] = useState<Record<string, number>>({});
  const [assessmentDomain, setAssessmentDomain] = useState('');
  const [assessmentLevel, setAssessmentLevel] = useState('');
  const [resumeText, setResumeText] = useState('');

  const startAssessment = useStartAssessment();
  const submitAssessment = useSubmitAssessment();
  const generateRoadmap = useGenerateRoadmap();

  const go = (next: Stage, dir = 1) => {
    setDirection(dir);
    setStage(next);
  };

  // Resume uploaded → start assessment using detected level/domain
  const onResumeComplete = async (_text: string, detectedLevel: string, detectedDomain: string) => {
    setResumeText(_text);
    setAssessmentDomain(detectedDomain);
    setAssessmentLevel(detectedLevel);
    try {
      const res = await startAssessment.mutateAsync({ level: detectedLevel, domain: detectedDomain });
      setQuestions(res.questions);
      go('assessment');
    } catch {
      go('manual');
    }
  };

  // Manual domain/level chosen → start assessment
  const onManualComplete = async (domain: string, level: string) => {
    setAssessmentDomain(domain);
    setAssessmentLevel(level);
    try {
      const res = await startAssessment.mutateAsync({ domain, level });
      setQuestions(res.questions);
      go('assessment');
    } catch {
      // If assessment fails, skip to generating roadmap with manual data
      await finishWithManual(domain, level);
    }
  };

  const finishWithManual = async (domain: string, level: string) => {
    try {
      await generateRoadmap.mutateAsync({ domain, level });
    } catch {
      // ignore — navigate to results anyway
    }
    setSkillMatrix({ [domain.replace(/ /g, '_').toLowerCase()]: 60 });
    go('results');
  };

  // Assessment answered → submit
  const onAssessmentComplete = async (answers: Record<string, string>) => {
    go('submitting');
    const answersArray = Object.entries(answers).map(([id, answer]) => ({ question_id: id, answer }));
    try {
      const res = await submitAssessment.mutateAsync({
        answers: answersArray,
        domain: assessmentDomain,
        level: assessmentLevel,
      });
      const matrix: Record<string, number> = {};
      (res.skill_matrix ?? []).forEach((s) => { matrix[s.skill] = s.score; });
      setSkillMatrix(matrix);
      go('results');
    } catch (err) {
      // Roadmap generation failed — try generating it separately as a fallback
      try {
        await generateRoadmap.mutateAsync({
          domain: assessmentDomain,
          level: assessmentLevel,
        });
        // Roadmap generated via fallback — go to results with empty skill matrix
        go('results');
      } catch {
        // Both attempts failed — show error page instead of broken dashboard
        go('error');
      }
    }
  };

  if (stage === 'submitting') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <p className="text-muted-foreground">Building your personalised roadmap…</p>
        <p className="text-xs text-muted-foreground/60">This may take up to 60 seconds</p>
      </div>
    );
  }

  const handleRetryRoadmap = async () => {
    go('submitting');
    try {
      await generateRoadmap.mutateAsync({ domain: assessmentDomain, level: assessmentLevel });
      go('results');
    } catch {
      go('error');
    }
  };

  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground">Roadmap generation failed</h2>
          <p className="text-sm text-muted-foreground">
            The AI service took too long or encountered an error. Your assessment was saved.
            You can try again or continue to the dashboard and generate a roadmap manually.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleRetryRoadmap}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-foreground">Career AI</span>
        </div>

        <div className="glass-panel rounded-2xl p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {stage === 'welcome' && (
                <WelcomeStep
                  onPickResume={() => go('resume')}
                  onPickAssessment={() => go('manual')}
                  onSkip={() => navigate('/dashboard')}
                />
              )}
              {stage === 'resume' && (
                <ResumeStep
                  onBack={() => go('welcome', -1)}
                  onComplete={onResumeComplete}
                />
              )}
              {stage === 'manual' && (
                <ManualStep
                  onBack={() => go('welcome', -1)}
                  onComplete={onManualComplete}
                />
              )}
              {stage === 'assessment' && questions.length > 0 && (
                <AssessmentStep
                  questions={questions}
                  onBack={() => go('manual', -1)}
                  onComplete={onAssessmentComplete}
                />
              )}
              {stage === 'results' && (
                <ResultsStep
                  skillMatrix={skillMatrix}
                  onDashboard={() => navigate('/dashboard')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip link */}
        {stage !== 'results' && stage !== 'submitting' && stage !== 'assessment' && (
          <p className="text-center mt-4 text-xs text-muted-foreground">
            <button onClick={() => navigate('/dashboard')} className="hover:text-foreground transition-colors">
              Skip onboarding
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
