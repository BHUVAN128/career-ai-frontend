// ─── Common ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  level: string;
  avatar_url: string | null;
  joined_date: string;
  diagnosis_completed: boolean;
  skill_matrix: Record<string, number> | null;
}

export interface UserMe {
  id: string;
  email: string;
  profile: UserProfile | null;
  streak_count: number;
  total_completed: number;
  total_steps: number;
}

// ─── Diagnosis ────────────────────────────────────────────────────────────────

export interface SkillMatrix {
  skill: string;
  score: number;
}

export interface DiagnosisResult {
  detected_level: string;
  recommended_domain: string;
  skill_matrix: SkillMatrix[];
  summary: string;
  weaknesses: string[];
  available_domains: string[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'scenario' | 'practical';
  options: string[] | null;
  difficulty: string;
}

export interface AssessmentQuestionsResponse {
  questions: AssessmentQuestion[];
  level: string;
  domain: string;
  layer: number;
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export interface ResourceLink {
  title: string;
  url: string;
  type: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  step_type: 'video' | 'reading' | 'quiz' | 'coding' | 'project' | 'reflection';
  status: 'locked' | 'active' | 'completed';
  difficulty: string;
  duration_minutes: number;
  order_index: number;
  content_data: Record<string, unknown> | null;
  resources: ResourceLink[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  order_index: number;
  steps: RoadmapStep[];
}

export interface Roadmap {
  id: string;
  title: string;
  domain: string;
  level: string;
  total_steps: number;
  completed_steps: number;
  phases: RoadmapPhase[];
  created_at: string;
}

export interface StepSubmitResponse {
  score: number | null;
  passed: boolean;
  feedback: {
    summary?: string;
    items?: QuizQuestionResult[];       // quiz per-question results
    challenge_results?: ChallengeResult[]; // coding per-challenge results
    ai_feedback?: string;
    suggestions?: string;
    strengths?: string[];
    improvements?: string[];
    [key: string]: unknown;
  };
  next_step_id: string | null;
  roadmap_adapted: boolean;
}

// ─── Video ────────────────────────────────────────────────────────────────────

export interface VideoRecommendation {
  found: boolean;
  video_id?: string;
  title?: string;
  thumbnail_url?: string;
  channel_name?: string;
  duration?: string;
  view_count?: string;
  query?: string;
}

// ─── Quiz / Coding result types ───────────────────────────────────────────────

export interface QuizQuestionResult {
  question_id: string;
  question: string;
  correct: boolean;
  user_answer: string;
  correct_answer: string;
  correct_answer_text: string;
  explanation: string;
}

export interface ChallengeResult {
  id: string;
  passed: boolean;
  score: number;
  feedback: string;
  correct_code: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SendMessageResponse {
  session_id: string;
  message: ChatMessage;
  reply: ChatMessage;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DailyDataPoint {
  day: string;
  date: string;
  score: number;
  hours: number;
  steps_completed: number;
}

export interface SkillScore {
  skill: string;
  score: number;
  max_score: number;
}

export interface WeeklySummary {
  completion_percent: number;
  accuracy_percent: number;
  skill_growth_delta: Record<string, number>;
  weakest_skill: string | null;
  learning_velocity: number;
  total_minutes: number;
  week_start: string;
}

export interface WeeklyAnalytics {
  daily_data: DailyDataPoint[];
  summary: WeeklySummary;
  skill_scores: SkillScore[];
}

export interface AnalyticsSummary {
  completion_rate: number;
  practice_accuracy: number;
  total_focus_minutes: number;
  current_streak: number;
  skills: SkillScore[];
  weekly_history: WeeklySummary[];
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface Streak {
  streak_count: number;
  longest_streak: number;
  last_activity_date: string | null;
  warning: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
  skills_used: string[];
  starter_repo_placeholder: string | null;
  completed: boolean;
  github_url: string | null;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  domain: string;
  location: string;
  level: string;
  description: string;
  required_skills: string[];
  apply_url: string | null;
}

// ─── Internship Recommendations ───────────────────────────────────────────────

export interface InternshipRecommendation {
  platform: string;
  title: string;
  description: string;
  apply_url: string;
  skills_needed: string[];
  duration: string;
  stipend_range: string | null;
  location: string;
}

export interface InternshipsResponse {
  eligible: boolean;
  domain: string;
  level: string;
  completion_percent: number;
  recommendations: InternshipRecommendation[];
  message: string | null;
}

// ─── Interview ────────────────────────────────────────────────────────────────

export interface InterviewQuestion {
  id: string;
  question: string;
  type: string;
}

export interface InterviewStartResponse {
  interview_id: string;
  question: InterviewQuestion;
  question_number: number;
  total_questions: number;
}

export interface InterviewAnswerResponse {
  acknowledged: boolean;
  next_question: InterviewQuestion | null;
  question_number: number;
  total_questions: number;
  completed: boolean;
}

export interface InterviewResult {
  interview_id: string;
  technical_score: number;
  clarity_score: number;
  confidence_score: number;
  completeness_score: number;
  overall_score: number;
  feedback: string;
  transcript: Array<{ question: string; answer: string; question_type: string }>;
}
