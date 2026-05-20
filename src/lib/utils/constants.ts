// ── App ──────────────────────────────────────────
export const APP_NAME = "AURA";
export const APP_DESCRIPTION =
  "Your emotionally intelligent AI life companion";
export const APP_VERSION = "0.1.0";

// ── Routes ───────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  FOCUS: "/focus",
  JOURNAL: "/journal",
  INSIGHTS: "/insights",
  RECOMMENDATIONS: "/recommendations",
  SETTINGS: "/settings",
} as const;

// ── Emotion States ────────────────────────────────
export const EMOTION_STATES = {
  FOCUSED: "focused",
  NEUTRAL: "neutral",
  STRESSED: "stressed",
  BURNED_OUT: "burned_out",
  ANXIOUS: "anxious",
  HAPPY: "happy",
} as const;

export type EmotionState =
  (typeof EMOTION_STATES)[keyof typeof EMOTION_STATES];

// ── Emotion Labels + Emojis ───────────────────────
export const EMOTION_CONFIG = {
  focused: { label: "Focused", emoji: "⚡", color: "var(--emotion-focused)" },
  neutral: { label: "Okay", emoji: "😐", color: "var(--emotion-neutral)" },
  stressed: { label: "Stressed", emoji: "😤", color: "var(--emotion-stressed)" },
  burned_out: { label: "Burnt out", emoji: "😮‍💨", color: "var(--emotion-burnout)" },
  anxious: { label: "Anxious", emoji: "😟", color: "var(--emotion-anxious)" },
  happy: { label: "Great", emoji: "😊", color: "var(--emotion-happy)" },
} as const;

// ── Focus Timer ───────────────────────────────────
export const FOCUS_DURATIONS = [15, 25, 45, 60, 90] as const;
export const BREAK_DURATIONS = [5, 7, 10, 15] as const;
export const DEFAULT_FOCUS_DURATION = 45;
export const DEFAULT_BREAK_DURATION = 7;

// ── Stress Thresholds ─────────────────────────────
export const STRESS_THRESHOLD_SOFT = 70;
export const STRESS_THRESHOLD_HARD = 85;
export const BURNOUT_THRESHOLD = 80;

// ── AI ────────────────────────────────────────────
export const AI_MODELS = {
  PRIMARY: "llama-3.3-70b-versatile",
  FAST: "llama-3.1-8b-instant",
} as const;

export const MAX_MEMORY_ITEMS = 5;
export const MAX_CHAT_HISTORY = 20;
export const AI_MAX_TOKENS = 1000;

// ── Tasks ─────────────────────────────────────────
export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DEFERRED: "deferred",
  CANCELLED: "cancelled",
} as const;

export type TaskStatus =
  (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const COGNITIVE_LOAD_LABELS = {
  1: "Very Light",
  2: "Light",
  3: "Moderate",
  4: "Heavy",
  5: "Very Heavy",
} as const;

// ── Notifications ─────────────────────────────────
export const QUIET_HOURS_START = 22;
export const QUIET_HOURS_END = 7;
export const MAX_INTERVENTIONS_PER_DAY = 3;

// ── Local Storage Keys ────────────────────────────
export const STORAGE_KEYS = {
  DEVICE_ID: "aura_device_id",
  FOCUS_MODE: "aura_focus_mode",
  EMOTION_STATE: "aura_emotion_state",
  THEME: "aura_theme",
  ONBOARDING_DONE: "aura_onboarding_done",
} as const;