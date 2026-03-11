export interface RoadmapStep {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'coding' | 'project' | 'reflection';
  status: 'locked' | 'active' | 'completed';
  description: string;
  duration: string;
  content_data?: Record<string, unknown> | null;
  resources?: Array<{ title: string; url: string; type: string }>;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  steps: RoadmapStep[];
}

export interface SkillScore {
  skill: string;
  score: number;
  maxScore: number;
}

export interface WeeklyData {
  day: string;
  score: number;
  hours: number;
}

export interface ProjectSuggestion {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  skills: string[];
  description: string;
  completed: boolean;
}

export const userProfile = {
  name: "Alex Chen",
  domain: "Full Stack Development",
  level: "Intermediate",
  streakCount: 5,
  totalCompleted: 24,
  totalSteps: 67,
  joinedDate: "2025-12-01",
};

export const roadmapData: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Phase 1 – Foundations",
    steps: [
      { id: "s1", title: "JavaScript Fundamentals", type: "video", status: "completed", description: "Core JS concepts: closures, prototypes, event loop", duration: "45 min" },
      { id: "s2", title: "ES6+ Deep Dive", type: "reading", status: "completed", description: "Arrow functions, destructuring, modules, promises", duration: "30 min" },
      { id: "s3", title: "JS Foundations Quiz", type: "quiz", status: "completed", description: "Test your understanding of core JavaScript", duration: "20 min" },
      { id: "s4", title: "TypeScript Essentials", type: "video", status: "completed", description: "Type system, interfaces, generics", duration: "1 hr" },
      { id: "s5", title: "Build a CLI Tool", type: "coding", status: "completed", description: "Create a command-line task manager in TypeScript", duration: "2 hr" },
    ],
  },
  {
    id: "phase-2",
    title: "Phase 2 – React Mastery",
    steps: [
      { id: "s6", title: "React Core Concepts", type: "video", status: "completed", description: "Components, JSX, props, state, lifecycle", duration: "1 hr" },
      { id: "s7", title: "Hooks In Depth", type: "reading", status: "active", description: "useState, useEffect, useCallback, useMemo, custom hooks", duration: "45 min" },
      { id: "s8", title: "State Management Patterns", type: "video", status: "locked", description: "Context API, Zustand, Redux Toolkit comparison", duration: "1 hr" },
      { id: "s9", title: "React Performance Quiz", type: "quiz", status: "locked", description: "Memoization, virtualization, code splitting", duration: "20 min" },
      { id: "s10", title: "Build a Dashboard", type: "project", status: "locked", description: "Create an analytics dashboard with charts and filters", duration: "4 hr" },
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3 – Backend & APIs",
    steps: [
      { id: "s11", title: "Node.js & Express", type: "video", status: "locked", description: "REST APIs, middleware, error handling", duration: "1.5 hr" },
      { id: "s12", title: "Database Design", type: "reading", status: "locked", description: "PostgreSQL, schemas, relations, indexing", duration: "1 hr" },
      { id: "s13", title: "API Design Quiz", type: "quiz", status: "locked", description: "RESTful conventions, status codes, auth patterns", duration: "20 min" },
      { id: "s14", title: "Build a REST API", type: "coding", status: "locked", description: "Full CRUD API with authentication", duration: "3 hr" },
      { id: "s15", title: "System Design Reflection", type: "reflection", status: "locked", description: "Document your API architecture decisions", duration: "30 min" },
    ],
  },
  {
    id: "phase-4",
    title: "Phase 4 – Advanced Patterns",
    steps: [
      { id: "s16", title: "GraphQL Fundamentals", type: "video", status: "locked", description: "Schemas, resolvers, queries, mutations", duration: "1 hr" },
      { id: "s17", title: "Testing Strategies", type: "reading", status: "locked", description: "Unit, integration, E2E with Vitest & Playwright", duration: "45 min" },
      { id: "s18", title: "Full Stack Project", type: "project", status: "locked", description: "Build a full stack app with auth, DB, and deployment", duration: "8 hr" },
    ],
  },
];

export const skillScores: SkillScore[] = [
  { skill: "JavaScript", score: 85, maxScore: 100 },
  { skill: "TypeScript", score: 72, maxScore: 100 },
  { skill: "React", score: 60, maxScore: 100 },
  { skill: "Node.js", score: 35, maxScore: 100 },
  { skill: "Databases", score: 28, maxScore: 100 },
  { skill: "System Design", score: 20, maxScore: 100 },
];

export const weeklyData: WeeklyData[] = [
  { day: "Mon", score: 78, hours: 2.5 },
  { day: "Tue", score: 82, hours: 3.0 },
  { day: "Wed", score: 75, hours: 1.5 },
  { day: "Thu", score: 90, hours: 2.0 },
  { day: "Fri", score: 88, hours: 2.5 },
  { day: "Sat", score: 92, hours: 4.0 },
  { day: "Sun", score: 85, hours: 1.0 },
];

export const projectSuggestions: ProjectSuggestion[] = [
  {
    id: "p1",
    title: "Build a Full Stack Blog Platform",
    difficulty: "Intermediate",
    estimatedHours: 20,
    skills: ["React", "Node.js", "PostgreSQL", "Auth"],
    description: "Create a modern blog with Markdown support, user auth, comments, and SEO.",
    completed: false,
  },
  {
    id: "p2",
    title: "Create an AI Chatbot API",
    difficulty: "Advanced",
    estimatedHours: 15,
    skills: ["Node.js", "OpenAI API", "WebSockets", "TypeScript"],
    description: "Build a real-time chatbot backend with streaming responses and context memory.",
    completed: false,
  },
  {
    id: "p3",
    title: "E-commerce Product Dashboard",
    difficulty: "Intermediate",
    estimatedHours: 25,
    skills: ["React", "Charts", "REST API", "State Management"],
    description: "Analytics dashboard for an e-commerce platform with sales charts and inventory.",
    completed: true,
  },
];

export const chatMessages = [
  { id: "1", role: "user" as const, content: "I'm struggling with useEffect cleanup. Can you explain?" },
  { id: "2", role: "assistant" as const, content: "Great question! useEffect cleanup runs when the component unmounts or before the effect re-runs. Return a function from your effect to clean up subscriptions, timers, or event listeners. This prevents memory leaks." },
  { id: "3", role: "user" as const, content: "When should I use useCallback vs useMemo?" },
  { id: "4", role: "assistant" as const, content: "useCallback memoizes a function reference — use it when passing callbacks to child components to prevent re-renders. useMemo memoizes a computed value — use it for expensive calculations. Both take a dependency array." },
];

export const badges = [
  { id: "b1", name: "First Step", icon: "🎯", unlocked: true, description: "Completed your first step" },
  { id: "b2", name: "7 Day Streak", icon: "🔥", unlocked: false, description: "Maintain a 7-day streak" },
  { id: "b3", name: "Quiz Master", icon: "🧠", unlocked: true, description: "Score 90%+ on 3 quizzes" },
  { id: "b4", name: "Project Finisher", icon: "🏆", unlocked: true, description: "Complete your first project" },
  { id: "b5", name: "Speed Learner", icon: "⚡", unlocked: false, description: "Complete 5 steps in one day" },
];
