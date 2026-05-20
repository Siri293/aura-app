"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FOCUS_DURATIONS, BREAK_DURATIONS, DEFAULT_FOCUS_DURATION, DEFAULT_BREAK_DURATION } from "@/lib/utils/constants";
import { clamp } from "@/lib/utils";

type TimerState = "idle" | "focus" | "break" | "completed";

const AMBIENT_SOUNDS = [
  { id: "none",       label: "No sound",    emoji: "🔇" },
  { id: "lofi",       label: "Lo-fi beats", emoji: "🎵" },
  { id: "rain",       label: "Rain",        emoji: "🌧️" },
  { id: "whitenoise", label: "White noise", emoji: "〰️" },
  { id: "forest",     label: "Forest",      emoji: "🌿" },
];

interface FocusTimerProps {
  onSessionComplete?: (minutes: number, focusScore: number) => void;
}

export default function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
  const [breakDuration] = useState(DEFAULT_BREAK_DURATION);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState("none");
  const [focusScore, setFocusScore] = useState(100);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const tabSwitchCount = useRef(0);

  // Track tab visibility for focus score
  useEffect(() => {
    function handleVisibilityChange() {
      if (timerState === "focus" && document.hidden) {
        tabSwitchCount.current += 1;
        const penalty = tabSwitchCount.current * 5;
        setFocusScore((prev) => clamp(prev - penalty, 0, 100));
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [timerState]);

  // Fetch today's sessions on mount
  useEffect(() => {
    fetch("/api/focus")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTotalMinutesToday(data.totalMinutes);
          setCompletedSessions(data.sessionCount);
        }
      })
      .catch(console.error);
  }, []);

  const endSession = useCallback(
    async (state: "completed" | "abandoned") => {
      if (!sessionId || !startTimeRef.current) return;

      clearInterval(intervalRef.current!);
      const actualMinutes = Math.floor(
        (Date.now() - startTimeRef.current.getTime()) / 60000
      );

      try {
        await fetch("/api/focus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "end",
            session_id: sessionId,
            actual_duration_minutes: actualMinutes,
            focus_score: focusScore,
            status: state,
          }),
        });

        if (state === "completed") {
          setCompletedSessions((p) => p + 1);
          setTotalMinutesToday((p) => p + actualMinutes);
          onSessionComplete?.(actualMinutes, focusScore);
        }
      } catch (err) {
        console.error("End session error:", err);
      }
    },
    [sessionId, focusScore, onSessionComplete]
  );

  // Timer tick
  useEffect(() => {
    if (timerState === "focus" || timerState === "break") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            if (timerState === "focus") {
              endSession("completed");
              setTimerState("break");
              setTimeLeft(breakDuration * 60);
              tabSwitchCount.current = 0;
            } else {
              setTimerState("completed");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [timerState, breakDuration, endSession]);

  async function startFocus() {
    setFocusScore(100);
    tabSwitchCount.current = 0;
    setTimeLeft(focusDuration * 60);
    startTimeRef.current = new Date();

    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          planned_duration_minutes: focusDuration,
          ambient_sound: selectedSound,
        }),
      });
      const data = await res.json();
      if (data.success) setSessionId(data.session.id);
    } catch (err) {
      console.error("Start session error:", err);
    }

    setTimerState("focus");
  }

  function stopSession() {
    endSession("abandoned");
    setTimerState("idle");
    setTimeLeft(focusDuration * 60);
    setSessionId(null);
  }

  function resetAfterBreak() {
    setTimerState("idle");
    setTimeLeft(focusDuration * 60);
    setSessionId(null);
    setFocusScore(100);
  }

  // Format time
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Progress percentage
  const totalSeconds =
    timerState === "break" ? breakDuration * 60 : focusDuration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Focus score color
  function getFocusScoreColor(score: number): string {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--warning)";
    return "var(--danger)";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 24px",
        gap: "24px",
        minHeight: "100%",
      }}
    >
      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {[
          { label: "Sessions today", value: completedSessions },
          { label: "Minutes focused", value: totalMinutesToday },
        ].map((stat) => (
          <div
            key={stat.label}
            className="aura-card"
            style={{
              flex: 1,
              padding: "16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
                margin: "4px 0 0",
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Timer circle */}
      <div style={{ position: "relative", width: "240px", height: "240px" }}>
        <svg
          width="240"
          height="240"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r="108"
            fill="none"
            stroke="var(--surface-secondary)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="120"
            cy="120"
            r="108"
            fill="none"
            stroke={
              timerState === "break"
                ? "var(--success)"
                : "var(--aura-primary)"
            }
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 108}`}
            strokeDashoffset={`${2 * Math.PI * 108 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>

        {/* Center content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          {timerState === "completed" ? (
            <>
              <p style={{ fontSize: "40px", margin: 0 }}>🎉</p>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--success)",
                  fontWeight: "600",
                  margin: "4px 0 0",
                }}
              >
                Break time!
              </p>
            </>
          ) : (
            <>
              <p
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-2px",
                }}
              >
                {formatTime(timeLeft)}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color:
                    timerState === "break"
                      ? "var(--success)"
                      : timerState === "focus"
                      ? "var(--aura-primary)"
                      : "var(--text-tertiary)",
                  margin: "4px 0 0",
                  fontWeight: "500",
                }}
              >
                {timerState === "idle"
                  ? "Ready to focus"
                  : timerState === "focus"
                  ? "Stay focused"
                  : "Take a break"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Focus score — only during focus */}
      {timerState === "focus" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 20px",
            background: "var(--surface-secondary)",
            borderRadius: "var(--radius-full)",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: getFocusScoreColor(focusScore),
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: getFocusScoreColor(focusScore),
            }}
          >
            Focus score: {focusScore}/100
          </span>
        </div>
      )}

      {/* Duration selector — idle only */}
      {timerState === "idle" && (
        <div style={{ width: "100%", maxWidth: "480px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              fontWeight: "500",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Session Duration
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {FOCUS_DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setFocusDuration(d);
                  setTimeLeft(d * 60);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  border: focusDuration === d
                    ? "2px solid var(--aura-primary)"
                    : "1.5px solid var(--card-border)",
                  background: focusDuration === d
                    ? "var(--aura-primary-light)"
                    : "transparent",
                  color: focusDuration === d
                    ? "var(--aura-primary)"
                    : "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: focusDuration === d ? "600" : "400",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sound selector — idle only */}
      {timerState === "idle" && (
        <div style={{ width: "100%", maxWidth: "480px" }}>
          <button
            onClick={() => setShowSoundPicker(!showSoundPicker)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              border: "0.5px solid var(--card-border)",
              background: "var(--surface-secondary)",
              color: "var(--text-secondary)",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              {AMBIENT_SOUNDS.find((s) => s.id === selectedSound)?.emoji}{" "}
              {AMBIENT_SOUNDS.find((s) => s.id === selectedSound)?.label}
            </span>
            <span style={{ fontSize: "12px" }}>
              {showSoundPicker ? "▲" : "▼"}
            </span>
          </button>

          {showSoundPicker && (
            <div
              className="animate-slide-up"
              style={{
                marginTop: "8px",
                padding: "8px",
                background: "var(--card-bg)",
                borderRadius: "var(--radius-md)",
                border: "0.5px solid var(--card-border)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    setSelectedSound(sound.id);
                    setShowSoundPicker(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background:
                      selectedSound === sound.id
                        ? "var(--aura-primary-light)"
                        : "transparent",
                    color:
                      selectedSound === sound.id
                        ? "var(--aura-primary)"
                        : "var(--text-secondary)",
                    fontSize: "13px",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <span>{sound.emoji}</span>
                  <span>{sound.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {timerState === "idle" && (
          <button
            onClick={startFocus}
            style={{
              flex: 1,
              padding: "16px",
              background: "var(--aura-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            ⚡ Start Focus Session
          </button>
        )}

        {timerState === "focus" && (
          <>
            <button
              onClick={stopSession}
              style={{
                flex: 1,
                padding: "14px",
                background: "transparent",
                color: "var(--danger)",
                border: "1.5px solid var(--danger)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              End Session
            </button>
          </>
        )}

        {(timerState === "break" || timerState === "completed") && (
          <>
            <button
              onClick={resetAfterBreak}
              style={{
                flex: 1,
                padding: "14px",
                background: "var(--aura-primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔄 Start Another Session
            </button>
            <button
              onClick={resetAfterBreak}
              style={{
                padding: "14px 20px",
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1.5px solid var(--card-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      {timerState === "focus" && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-tertiary)",
            textAlign: "center",
            maxWidth: "320px",
          }}
        >
          💡 Stay on this tab to maintain your focus score. Notifications are
          silenced.
        </p>
      )}
    </div>
  );
}