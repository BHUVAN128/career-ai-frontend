import axios, { AxiosError, type AxiosInstance } from 'axios';
import type {
  ApiResponse, TokenResponse, UserMe, DiagnosisResult,
  AssessmentQuestionsResponse, Roadmap, StepSubmitResponse,
  SendMessageResponse, ChatMessage, WeeklyAnalytics, AnalyticsSummary,
  Badge, Streak, Project, Internship, InternshipsResponse,
  InterviewStartResponse, InterviewAnswerResponse, InterviewResult,
  VideoRecommendation,
} from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('career_ai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error normalisation
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ error?: string; detail?: string }>) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      err.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Helper: unwrap ApiResponse
async function callApi<T>(fn: () => Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await fn();
  if (!response.data.success) {
    throw new Error(response.data.error || 'API error');
  }
  return response.data.data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (email: string, password: string, name: string) =>
    callApi<TokenResponse>(() => api.post('/api/auth/signup', { email, password, name })),

  login: (email: string, password: string) =>
    callApi<TokenResponse>(() => api.post('/api/auth/login', { email, password })),

  me: () =>
    callApi<UserMe>(() => api.get('/api/auth/me')),

  updateProfile: (data: { name?: string; domain?: string; level?: string }) =>
    callApi(() => api.patch('/api/auth/profile', data)),

  resendConfirmation: (email: string) =>
    callApi<{ sent: boolean }>(() => api.post('/api/auth/resend-confirmation', { email })),
};

// ─── Diagnosis ────────────────────────────────────────────────────────────────

export const diagnosisApi = {
  uploadResume: (formData: FormData) =>
    callApi<DiagnosisResult>(() =>
      api.post('/api/diagnosis/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000, // LLM resume analysis can take a while
      })
    ),

  submitResumeText: (resumeText: string) => {
    const formData = new FormData();
    formData.append('resume_text', resumeText);
    return callApi<DiagnosisResult>(() =>
      api.post('/api/diagnosis/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
      })
    );
  },

  startAssessment: (level: string, domain: string) =>
    callApi<AssessmentQuestionsResponse>(() =>
      api.post('/api/diagnosis/start-assessment', { level, domain }, { timeout: 60_000 })
    ),

  // 120 s — two sequential LLM calls: evaluate assessment + generate full roadmap
  submitAssessment: (answers: Array<{ question_id: string; answer: string }>, level: string, domain: string) =>
    callApi<DiagnosisResult>(() =>
      api.post('/api/diagnosis/submit-assessment', { answers, level, domain }, { timeout: 120_000 })
    ),
};

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export const roadmapApi = {
  // Returns null (not an error) when the user has no roadmap yet
  get: async (): Promise<Roadmap | null> => {
    const response = await api.get<ApiResponse<Roadmap>>('/api/roadmap');
    if (!response.data.success) return null;
    return response.data.data as Roadmap;
  },

  generate: (domain: string, level: string, skill_matrix?: Record<string, number>) =>
    callApi<Roadmap>(() =>
      api.post('/api/roadmap/generate', { domain, level, skill_matrix }, { timeout: 120_000 })
    ),

  getStep: (stepId: string) =>
    callApi(() => api.get(`/api/roadmap/step/${stepId}`)),

  generateTopicContent: (stepId: string) =>
    callApi<{ generated: boolean; reason?: string; topic_key?: string }>(() =>
      api.post(`/api/roadmap/topic/${stepId}/generate-content`)
    ),

  submitStep: (stepId: string, data: {
    submission_type: string;
    content: Record<string, unknown>;
    time_spent_seconds?: number;
  }) =>
    callApi<StepSubmitResponse>(() => api.post(`/api/roadmap/step/${stepId}/submit`, data)),

  getVideoRecommendation: (stepId: string, lang: string) =>
    callApi<VideoRecommendation>(() =>
      api.get(`/api/roadmap/step/${stepId}/video`, { params: { lang }, timeout: 30_000 })
    ),
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const chatApi = {
  sendMessage: (message: string, sessionId?: string, contextStepId?: string) =>
    callApi<SendMessageResponse>(() =>
      api.post('/api/chat/message', {
        message,
        session_id: sessionId,
        context_step_id: contextStepId,
      })
    ),

  getHistory: (sessionId: string) =>
    callApi<ChatMessage[]>(() => api.get(`/api/chat/history/${sessionId}`)),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  weekly: () =>
    callApi<WeeklyAnalytics>(() => api.get('/api/analytics/weekly')),

  summary: () =>
    callApi<AnalyticsSummary>(() => api.get('/api/analytics/summary')),
};

// ─── Gamification ─────────────────────────────────────────────────────────────

export const gamificationApi = {
  streak: () =>
    callApi<Streak>(() => api.get('/api/gamification/streak')),

  badges: () =>
    callApi<Badge[]>(() => api.get('/api/gamification/badges')),

  checkBadges: () =>
    callApi<string[]>(() => api.post('/api/gamification/badges/check', {})),

  projects: () =>
    callApi<Project[]>(() => api.get('/api/gamification/projects')),

  submitProject: (projectId: string, githubUrl?: string) =>
    callApi<Project>(() =>
      api.post('/api/gamification/projects/submit', { project_id: projectId, github_url: githubUrl })
    ),

  internships: (domain?: string, level?: string) => {
    const params = new URLSearchParams();
    if (domain) params.append('domain', domain);
    if (level) params.append('level', level);
    return callApi<Internship[]>(() =>
      api.get(`/api/gamification/internships?${params.toString()}`)
    );
  },
};

// ─── Internship Recommendations ──────────────────────────────────────────────

export const internshipsApi = {
  getRecommendations: () =>
    callApi<InternshipsResponse>(() =>
      api.get('/api/internships/recommendations', { timeout: 60_000 })
    ),
};

// ─── Interview ────────────────────────────────────────────────────────────────

export const interviewApi = {
  start: (domain: string, level: string) =>
    callApi<InterviewStartResponse>(() =>
      api.post('/api/interview/start', { domain, level })
    ),

  answer: (interviewId: string, answer: string) =>
    callApi<InterviewAnswerResponse>(() =>
      api.post(`/api/interview/${interviewId}/answer`, { answer })
    ),

  result: (interviewId: string) =>
    callApi<InterviewResult>(() => api.get(`/api/interview/${interviewId}/result`)),
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
