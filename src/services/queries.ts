import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, diagnosisApi, roadmapApi, chatApi, analyticsApi, gamificationApi, interviewApi, internshipsApi } from './api';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  me: ['auth', 'me'] as const,
  roadmap: ['roadmap'] as const,
  weeklyAnalytics: ['analytics', 'weekly'] as const,
  analyticsSummary: ['analytics', 'summary'] as const,
  badges: ['gamification', 'badges'] as const,
  streak: ['gamification', 'streak'] as const,
  projects: ['gamification', 'projects'] as const,
  internships: (domain?: string, level?: string) => ['gamification', 'internships', domain, level] as const,
  internshipRecommendations: ['internships', 'recommendations'] as const,
  chatHistory: (sessionId: string) => ['chat', 'history', sessionId] as const,
};

// ─── Auth Hooks ───────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('career_ai_token', data.access_token);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authApi.signup(email, password, name),
    onSuccess: (data) => {
      localStorage.setItem('career_ai_token', data.access_token);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
}

// ─── Diagnosis Hooks ──────────────────────────────────────────────────────────

export function useStartAssessment() {
  return useMutation({
    mutationFn: ({ level, domain }: { level: string; domain: string }) =>
      diagnosisApi.startAssessment(level, domain),
  });
}

export function useSubmitAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      answers: Array<{ question_id: string; answer: string }>;
      level: string;
      domain: string;
    }) => diagnosisApi.submitAssessment(data.answers, data.level, data.domain),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.roadmap });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => diagnosisApi.uploadResume(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
}

export function useSubmitResumeText() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => diagnosisApi.submitResumeText(text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
}

// ─── Roadmap Hooks ────────────────────────────────────────────────────────────

export function useRoadmap() {
  return useQuery({
    queryKey: QUERY_KEYS.roadmap,
    queryFn: roadmapApi.get,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useGenerateRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { domain: string; level: string; skill_matrix?: Record<string, number> }) =>
      roadmapApi.generate(data.domain, data.level, data.skill_matrix),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.roadmap });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
}

export function useGenerateTopicContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) => roadmapApi.generateTopicContent(stepId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.roadmap });
    },
  });
}

export function useVideoRecommendation(stepId: string | null, lang: string) {
  return useQuery({
    queryKey: ['roadmap', 'video', stepId, lang],
    queryFn: () => roadmapApi.getVideoRecommendation(stepId!, lang),
    enabled: !!stepId,
    staleTime: 60 * 60 * 1000, // 1 hour — matches server cache
    retry: 1,
  });
}

export function useSubmitStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      stepId: string;
      submission_type: string;
      content: Record<string, unknown>;
      time_spent_seconds?: number;
    }) =>
      roadmapApi.submitStep(data.stepId, {
        submission_type: data.submission_type,
        content: data.content,
        time_spent_seconds: data.time_spent_seconds ?? 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.roadmap });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.streak });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.analyticsSummary });
    },
  });
}

// ─── Chat Hooks ───────────────────────────────────────────────────────────────

export function useSendMessage() {
  return useMutation({
    mutationFn: (data: { message: string; sessionId?: string; contextStepId?: string }) =>
      chatApi.sendMessage(data.message, data.sessionId, data.contextStepId),
  });
}

export function useChatHistory(sessionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.chatHistory(sessionId),
    queryFn: () => chatApi.getHistory(sessionId),
    enabled: !!sessionId,
  });
}

// ─── Analytics Hooks ──────────────────────────────────────────────────────────

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: QUERY_KEYS.weeklyAnalytics,
    queryFn: analyticsApi.weekly,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.analyticsSummary,
    queryFn: analyticsApi.summary,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Gamification Hooks ───────────────────────────────────────────────────────

export function useStreak() {
  return useQuery({
    queryKey: QUERY_KEYS.streak,
    queryFn: gamificationApi.streak,
    staleTime: 60 * 1000,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: QUERY_KEYS.badges,
    queryFn: gamificationApi.badges,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: gamificationApi.projects,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useInternships(domain?: string, level?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.internships(domain, level),
    queryFn: () => gamificationApi.internships(domain, level),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubmitProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, githubUrl }: { projectId: string; githubUrl?: string }) =>
      gamificationApi.submitProject(projectId, githubUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.badges });
    },
  });
}

// ─── Interview Hooks ──────────────────────────────────────────────────────────

export function useStartInterview() {
  return useMutation({
    mutationFn: ({ domain, level }: { domain: string; level: string }) =>
      interviewApi.start(domain, level),
  });
}

export function useAnswerInterview() {
  return useMutation({
    mutationFn: ({ interviewId, answer }: { interviewId: string; answer: string }) =>
      interviewApi.answer(interviewId, answer),
  });
}

export function useInterviewResult(interviewId: string) {
  return useQuery({
    queryKey: ['interview', 'result', interviewId],
    queryFn: () => interviewApi.result(interviewId),
    enabled: !!interviewId,
  });
}

// ─── Internship Recommendation Hooks ────────────────────────────────────────────

export function useInternshipRecommendations() {
  return useQuery({
    queryKey: QUERY_KEYS.internshipRecommendations,
    queryFn: internshipsApi.getRecommendations,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
