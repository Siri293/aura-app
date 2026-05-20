"use client";

import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { useEmotionLog } from "@/lib/hooks/useEmotionLog";

interface Recommendation {
  id: string;
  type: "action" | "content" | "task" | "social";
  emoji: string;
  title: string;
  description: string;
  reason: string;
  actionLabel: string;
  actionUrl?: string;
}

function getRecommendations(emotionState: string | null): Recommendation[] {
  const base: Recommendation[] = [
    {
      id: "focus-session",
      type: "action",
      emoji: "⚡",
      title: "Start a Focus Session",
      description: "Block distractions and get into deep work mode for 25–45 minutes.",
      reason: "Regular focus sessions improve productivity by 40%",
      actionLabel: "Start Focus →",
      actionUrl: "/focus",
    },
    {
      id: "journal-entry",
      type: "action",
      emoji: "📓",
      title: "Write in Your Journal",
      description: "Spend 5 minutes reflecting on your day. AURA will analyze your mood.",
      reason: "Journaling reduces stress and improves clarity",
      actionLabel: "Open Journal →",
      actionUrl: "/journal",
    },
    {
      id: "breathing",
      type: "action",
      emoji: "🌬️",
      title: "4-7-8 Breathing Exercise",
      description: "Inhale 4 seconds, hold 7, exhale 8. Repeat 4 times. Reduces anxiety instantly.",
      reason: "Proven to activate your parasympathetic nervous system",
      actionLabel: "Try it now",
    },
    {
      id: "hydrate",
      type: "action",
      emoji: "💧",
      title: "Drink a Glass of Water",
      description: "Dehydration reduces cognitive performance by up to 20%. Take a quick break.",
      reason: "You may have been working for a while",
      actionLabel: "Done ✓",
    },
    {
      id: "walk",
      type: "action",
      emoji: "🚶",
      title: "Take a 10-Minute Walk",
      description: "A short walk boosts creativity, reduces cortisol, and clears your mind.",
      reason: "Movement is one of the fastest stress relievers",
      actionLabel: "Log break",
    },
    {
      id: "pomodoro",
      type: "task",
      emoji: "🍅",
      title: "Try the Pomodoro Technique",
      description: "Work 25 min, break 5 min. Repeat. One of the most effective productivity methods.",
      reason: "Structured work blocks reduce mental fatigue",
      actionLabel: "Start Timer →",
      actionUrl: "/focus",
    },
    {
      id: "insights",
      type: "content",
      emoji: "📊",
      title: "Review Your Weekly Insights",
      description: "See your mood patterns, focus trends, and stress levels over the past 7 days.",
      reason: "Understanding your patterns helps you improve them",
      actionLabel: "View Insights →",
      actionUrl: "/insights",
    },
    {
      id: "chat-aura",
      type: "social",
      emoji: "💬",
      title: "Talk to AURA",
      description: "Share what's on your mind. AURA listens without judgment and offers support.",
      reason: "Sometimes you just need to express how you feel",
      actionLabel: "Chat now →",
      actionUrl: "/chat",
    },
  ];

  // Emotion-specific recommendations
  const emotionSpecific: Record<string, Recommendation[]> = {
    stressed: [
      {
        id: "stress-relief",
        type: "action",
        emoji: "🧘",
        title: "5-Minute Meditation",
        description: "Close your eyes, focus on your breath. Let thoughts pass without judgment.",
        reason: "You seem stressed — this will help right now",
        actionLabel: "Start guided meditation",
      },
      {
        id: "task-defer",
        type: "task",
        emoji: "📋",
        title: "Defer Non-Urgent Tasks",
        description: "Go to your task list and defer everything that isn't due today.",
        reason: "Reducing your visible task load lowers cognitive pressure",
        actionLabel: "View Tasks →",
        actionUrl: "/dashboard",
      },
    ],
    anxious: [
      {
        id: "grounding",
        type: "action",
        emoji: "🌱",
        title: "5-4-3-2-1 Grounding",
        description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
        reason: "Grounding techniques interrupt anxiety spirals quickly",
        actionLabel: "Try it now",
      },
    ],
    burned_out: [
      {
        id: "rest",
        type: "action",
        emoji: "😴",
        title: "Take a Real Break",
        description: "Step away from your screen for at least 30 minutes. No phone, no laptop.",
        reason: "You've been pushing hard — rest is productive too",
        actionLabel: "Set a reminder",
      },
    ],
    focused: [
      {
        id: "deep-work",
        type: "action",
        emoji: "🔥",
        title: "You're in the zone — go deep",
        description: "Your focus is high right now. Start your hardest task while energy is peak.",
        reason: "Don't waste your peak focus state on easy tasks",
        actionLabel: "Start Focus →",
        actionUrl: "/focus",
      },
    ],
    happy: [
      {
        id: "momentum",
        type: "task",
        emoji: "🚀",
        title: "Ride the momentum",
        description: "You're feeling great — this is the perfect time to tackle a challenging task.",
        reason: "Positive emotions boost creativity and problem-solving",
        actionLabel: "View Tasks →",
        actionUrl: "/dashboard",
      },
    ],
  };

  const specific = emotionState
    ? emotionSpecific[emotionState] ?? []
    : [];

  return [...specific, ...base].slice(0, 8);
}

const TYPE_COLORS = {
  action:  { bg: "var(--aura-primary-light)",  color: "var(--aura-primary)",  label: "Action"  },
  content: { bg: "var(--success-bg)",          color: "var(--success)",       label: "Content" },
  task:    { bg: "var(--warning-bg)",           color: "var(--warning)",       label: "Task"    },
  social:  { bg: "var(--emotion-anxious-bg)",  color: "var(--emotion-anxious)", label: "Social" },
};

export default function RecommendationsPage() {
  const { currentEmotionState, currentEmotionConfig } = useEmotionLog();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRecommendations(getRecommendations(currentEmotionState));
  }, [currentEmotionState]);

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  function handleSave(id: string) {
    setSaved((prev) => new Set([...prev, id]));
  }

  const visible = recommendations.filter((r) => !dismissed.has(r.id));

  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <PageWrapper>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
              margin: "0 0 4px 0",
            }}
          >
            For You ⭐
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            {currentEmotionConfig
              ? `Based on your ${currentEmotionConfig.emoji} ${currentEmotionConfig.label} mood`
              : "Personalized suggestions from AURA"}
          </p>
        </div>

        {/* Current mood banner */}
        {currentEmotionState && currentEmotionConfig && (
          <div
            className="aura-card animate-fade-in"
            style={{
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--aura-primary-light)",
              border: "1px solid var(--aura-primary)",
            }}
          >
            <span style={{ fontSize: "28px" }}>{currentEmotionConfig.emoji}</span>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--aura-primary)",
                  margin: 0,
                }}
              >
                You&apos;re feeling {currentEmotionConfig.label}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                AURA has tailored these recommendations for your current state
              </p>
            </div>
          </div>
        )}

        {/* Recommendations grid */}
        {visible.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              color: "var(--text-tertiary)",
            }}
          >
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>✨</p>
            <p style={{ fontSize: "14px" }}>
              All caught up! Log your mood for fresh recommendations.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "14px",
            }}
          >
            {visible.map((rec) => {
              const typeConfig = TYPE_COLORS[rec.type];
              const isSaved = saved.has(rec.id);

              return (
                <div
                  key={rec.id}
                  className="aura-card animate-fade-in"
                  style={{ padding: "20px" }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "28px" }}>{rec.emoji}</span>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          background: typeConfig.bg,
                          color: typeConfig.color,
                          fontWeight: "600",
                        }}
                      >
                        {typeConfig.label}
                      </span>
                    </div>

                    {/* Dismiss button */}
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-tertiary)",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "2px",
                        lineHeight: 1,
                      }}
                      title="Dismiss"
                    >
                      ×
                    </button>
                  </div>

                  {/* Content */}
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      margin: "0 0 6px",
                    }}
                  >
                    {rec.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      margin: "0 0 10px",
                    }}
                  >
                    {rec.description}
                  </p>

                  {/* Reason */}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                      margin: "0 0 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    💡 {rec.reason}
                  </p>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        if (rec.actionUrl) {
                          window.location.href = rec.actionUrl;
                        } else {
                          handleSave(rec.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "9px 14px",
                        background: "var(--aura-primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {rec.actionLabel}
                    </button>

                    <button
                      onClick={() => handleSave(rec.id)}
                      style={{
                        padding: "9px 12px",
                        background: isSaved
                          ? "var(--success-bg)"
                          : "var(--surface-secondary)",
                        color: isSaved
                          ? "var(--success)"
                          : "var(--text-tertiary)",
                        border: `1px solid ${isSaved ? "var(--success)" : "var(--card-border)"}`,
                        borderRadius: "var(--radius-md)",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                      title="Save for later"
                    >
                      {isSaved ? "✓" : "🔖"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: "32px" }} />
      </PageWrapper>
    </div>
  );
}