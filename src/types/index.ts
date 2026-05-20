export type { EmotionState, TaskStatus } from "@/lib/utils/constants";

// ── User ──────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  timezone?: string;
  onboarding_completed?: boolean;
  created_at?: string;
}

// ── Task ──────────────────────────────────────────
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cognitive_load_score?: number;
  priority_score?: number;
  status: string;
  due_date?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// ── Emotion Log ───────────────────────────────────
export interface EmotionLog {
  id: string;
  user_id: string;
  emotion_state: string;
  emotion_score: number;
  stress_score?: number;
  inference_source?: string;
  logged_at: string;
}

// ── Journal Entry ─────────────────────────────────
export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  sentiment_score?: number;
  sentiment_label?: string;
  ai_reflection?: string;
  created_at: string;
}

// ── Focus Session ─────────────────────────────────
export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string;
  planned_duration_minutes: number;
  actual_duration_minutes?: number;
  focus_score?: number;
  status: string;
  started_at: string;
  ended_at?: string;
}

// ── Memory ────────────────────────────────────────
export interface Memory {
  id: string;
  user_id: string;
  memory_type: "episodic" | "semantic" | "procedural";
  content: string;
  relevance_weight: number;
  created_at: string;
}

// ── Context Vector ────────────────────────────────
export interface ContextVector {
  userId: string;
  emotionState: string;
  stressScore: number;
  timeOfDay: "early_morning" | "morning" | "afternoon" | "evening" | "night";
  pendingTasksCount: number;
  overdueTasksCount: number;
  nextEventMinutes: number;
  sessionDurationMinutes: number;
  appSwitchesLastHour: number;
  isWeekend: boolean;
}

// ── AI Message ────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Recommendation ────────────────────────────────
export interface Recommendation {
  id: string;
  type: "content" | "action" | "social" | "task";
  title: string;
  description: string;
  reason: string;
  action_url?: string;
}