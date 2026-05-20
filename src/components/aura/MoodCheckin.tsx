"use client";

import { useState } from "react";
import { EMOTION_CONFIG, EMOTION_STATES } from "@/lib/utils/constants";
import type { EmotionState } from "@/lib/utils/constants";

interface MoodCheckinProps {
  onMoodSelect?: (mood: EmotionState) => void;
  onMoodLogged?: (mood: EmotionState) => void;
  selectedMood?: EmotionState | null;
}

const moods: { state: EmotionState; emoji: string; label: string }[] = [
  { state: EMOTION_STATES.STRESSED,   emoji: "😤", label: "Stressed"  },
  { state: EMOTION_STATES.ANXIOUS,    emoji: "😟", label: "Anxious"   },
  { state: EMOTION_STATES.NEUTRAL,    emoji: "😐", label: "Okay"      },
  { state: EMOTION_STATES.HAPPY,      emoji: "😊", label: "Good"      },
  { state: EMOTION_STATES.FOCUSED,    emoji: "⚡", label: "Focused"   },
];

export default function MoodCheckin({
  onMoodSelect,
  onMoodLogged,
  selectedMood,
}: MoodCheckinProps) {
  const [hovered, setHovered] = useState<EmotionState | null>(null);
  const [selected, setSelected] = useState<EmotionState | null>(
    selectedMood ?? null
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSelect(mood: EmotionState) {
    setSelected(mood);
    onMoodSelect?.(mood);
  }

  async function handleSubmit() {
    if (!selected || saving) return;
    setSaving(true);

    try {
      const scoreMap: Record<EmotionState, number> = {
        focused: 85, happy: 80, neutral: 50,
        anxious: 35, stressed: 25, burned_out: 10,
      };
      const stressMap: Record<EmotionState, number> = {
        focused: 10, happy: 15, neutral: 30,
        anxious: 65, stressed: 75, burned_out: 85,
      };

      const res = await fetch("/api/emotion/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion_state: selected,
          emotion_score: scoreMap[selected],
          stress_score: stressMap[selected],
          inference_source: "self_report",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onMoodLogged?.(selected);
      }
    } catch (err) {
      console.error("Failed to log mood:", err);
    } finally {
      setSaving(false);
    }
  }

  if (submitted && selected) {
    const emotion = EMOTION_CONFIG[selected];
    return (
      <div className="aura-card animate-fade-in" style={{ padding: "24px" }}>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-tertiary)",
            marginBottom: "12px",
            fontWeight: "500",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          How are you feeling?
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>{emotion.emoji}</span>
          <div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {emotion.label}
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
              AURA has noted your mood ✓
            </p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setSelected(null); }}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "0.5px solid var(--card-border)",
              borderRadius: "var(--radius-full)",
              padding: "4px 12px",
              fontSize: "12px",
              color: "var(--text-tertiary)",
              cursor: "pointer",
            }}
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aura-card animate-fade-in" style={{ padding: "24px" }}>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-tertiary)",
          marginBottom: "16px",
          fontWeight: "500",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}
      >
        How are you feeling?
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {moods.map(({ state, emoji, label }) => {
          const isSelected = selected === state;
          const isHovered = hovered === state;

          return (
            <button
              key={state}
              onClick={() => handleSelect(state)}
              onMouseEnter={() => setHovered(state)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: isSelected
                  ? `2px solid ${EMOTION_CONFIG[state].color}`
                  : "1.5px solid var(--card-border)",
                background: isSelected
                  ? `color-mix(in srgb, ${EMOTION_CONFIG[state].color} 10%, transparent)`
                  : isHovered
                  ? "var(--surface-secondary)"
                  : "transparent",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                transform: isHovered || isSelected ? "scale(1.05)" : "scale(1)",
                flex: "1",
                minWidth: "64px",
              }}
            >
              <span style={{ fontSize: "28px", lineHeight: 1 }}>{emoji}</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isSelected ? "600" : "400",
                  color: isSelected
                    ? EMOTION_CONFIG[state].color
                    : "var(--text-secondary)",
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
          {selected
            ? `You selected: ${EMOTION_CONFIG[selected].label}`
            : "AURA is observing your patterns..."}
        </p>

        <button
          onClick={handleSubmit}
          disabled={!selected || saving}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--radius-full)",
            background: selected && !saving
              ? "var(--aura-primary)"
              : "var(--surface-secondary)",
            color: selected && !saving ? "white" : "var(--text-tertiary)",
            border: "none",
            fontSize: "13px",
            fontWeight: "500",
            cursor: selected && !saving ? "pointer" : "not-allowed",
            transition: "all var(--transition-fast)",
          }}
        >
          {saving ? "Saving..." : "Log mood"}
        </button>
      </div>
    </div>
  );
}