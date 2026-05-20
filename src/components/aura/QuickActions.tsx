"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/utils/constants";

const actions = [
  {
    label: "Start Focus",
    emoji: "⚡",
    href: ROUTES.FOCUS,
    color: "var(--emotion-focused)",
    bg: "var(--emotion-focused-bg)",
  },
  {
    label: "Chat with AURA",
    emoji: "💬",
    href: ROUTES.CHAT,
    color: "var(--aura-primary)",
    bg: "var(--aura-primary-light)",
  },
  {
    label: "Write in Journal",
    emoji: "📓",
    href: ROUTES.JOURNAL,
    color: "#7c5cbb",
    bg: "var(--emotion-anxious-bg)",
  },
  {
    label: "View Insights",
    emoji: "📊",
    href: ROUTES.INSIGHTS,
    color: "var(--success)",
    bg: "var(--success-bg)",
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-tertiary)",
          fontWeight: "500",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Quick Actions
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        {actions.map((action) => (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "16px 8px",
              background: action.bg,
              border: "0.5px solid var(--card-border)",
              borderRadius: "var(--radius-lg)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={{ fontSize: "24px", lineHeight: 1 }}>
              {action.emoji}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: action.color,
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}