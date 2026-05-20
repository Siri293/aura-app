"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useEmotionLog } from "@/lib/hooks/useEmotionLog";
import { EMOTION_CONFIG } from "@/lib/utils/constants";
import { useState, useEffect } from "react";

export default function TopBar() {
  const { displayName, initial, loading } = useUser();
  const { currentEmotionState, currentEmotionConfig } = useEmotionLog();
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Use real emotion or fallback to neutral
  const emotion = currentEmotionConfig ?? EMOTION_CONFIG["neutral"];

  return (
    <header
      style={{
        height: "var(--topbar-height)",
        background: "var(--card-bg)",
        borderBottom: "0.5px solid var(--card-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Left — Greeting + time */}
      <div>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {loading ? "Loading..." : `Hey, ${displayName} 👋`}
        </h2>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-tertiary)",
            margin: 0,
          }}
        >
          {time}
        </p>
      </div>

      {/* Right — Emotion + Notifications + Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* Live emotion pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "var(--radius-full)",
            background: "var(--surface-secondary)",
            border: "0.5px solid var(--card-border)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            fontWeight: "500",
            cursor: "default",
            transition: "all var(--transition-base)",
          }}
        >
          <span style={{ fontSize: "15px" }}>{emotion.emoji}</span>
          <span>{emotion.label}</span>
        </div>

        {/* Notification bell */}
        <button
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--surface-secondary)",
            border: "0.5px solid var(--card-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            color: "var(--text-secondary)",
            transition: "all var(--transition-fast)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--aura-primary-light)";
            e.currentTarget.style.color = "var(--aura-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-secondary)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          aria-label="Notifications"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: "7px",
              right: "7px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--aura-primary)",
              border: "1.5px solid var(--card-bg)",
            }}
          />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--aura-primary), var(--aura-primary-dark))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {loading ? "•" : initial}
        </div>
      </div>
    </header>
  );
}