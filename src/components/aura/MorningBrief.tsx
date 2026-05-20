"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/utils/constants";

interface BriefTask {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
}

interface MorningBriefProps {
  userName?: string;
  briefText?: string;
  keyTasks?: BriefTask[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="skeleton"
      style={{
        height: "16px",
        width,
        borderRadius: "var(--radius-sm)",
        marginBottom: "8px",
      }}
    />
  );
}

function PriorityDot({ priority }: { priority: BriefTask["priority"] }) {
  const colors = {
    high: "var(--danger)",
    medium: "var(--warning)",
    low: "var(--success)",
  };
  return (
    <div
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: colors[priority],
        flexShrink: 0,
        marginTop: "2px",
      }}
    />
  );
}

const DEMO_BRIEF: MorningBriefProps = {
  briefText:
    "You have a moderate day ahead with 3 key tasks. Your energy looks good — I've scheduled your hardest task first. Remember to take breaks every 45 minutes.",
  keyTasks: [
    {
      id: "1",
      title: "Complete project proposal draft",
      estimatedMinutes: 60,
      priority: "high",
    },
    {
      id: "2",
      title: "Review team feedback notes",
      estimatedMinutes: 30,
      priority: "medium",
    },
    {
      id: "3",
      title: "Reply to pending emails",
      estimatedMinutes: 20,
      priority: "low",
    },
  ],
};

export default function MorningBrief({
  userName = "there",
  briefText = DEMO_BRIEF.briefText,
  keyTasks = DEMO_BRIEF.keyTasks,
  isLoading = false,
  onRefresh,
}: MorningBriefProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div
        className="aura-card animate-fade-in"
        style={{
          padding: "24px",
          background: "var(--aura-primary)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "12px",
            fontWeight: "500",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Morning Brief
        </p>
        <SkeletonLine width="60%" />
        <SkeletonLine width="90%" />
        <SkeletonLine width="75%" />
      </div>
    );
  }

  return (
    <div
      className="aura-card animate-fade-in"
      style={{
        background:
          "linear-gradient(135deg, var(--aura-primary) 0%, var(--aura-primary-dark) 100%)",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Top section */}
      <div style={{ padding: "24px 24px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              opacity: 0.75,
              fontWeight: "500",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            ✨ Morning Brief
          </p>

          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "4px 10px",
                color: "white",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "10px",
            lineHeight: 1.4,
          }}
        >
          Good morning, {userName} 👋
        </h2>

        <p
          style={{
            fontSize: "14px",
            opacity: 0.9,
            lineHeight: 1.7,
            marginBottom: "16px",
          }}
        >
          {briefText}
        </p>
      </div>

      {/* Key tasks */}
      {keyTasks && keyTasks.length > 0 && (
        <div style={{ padding: "0 24px" }}>
          <p
            style={{
              fontSize: "11px",
              opacity: 0.7,
              fontWeight: "600",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Today&apos;s Focus
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {(expanded ? keyTasks : keyTasks.slice(0, 2)).map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "var(--radius-md)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <PriorityDot priority={task.priority} />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      margin: "0 0 2px 0",
                      color: "white",
                    }}
                  >
                    {task.title}
                  </p>
                  <p style={{ fontSize: "11px", opacity: 0.65, margin: 0 }}>
                    ~{task.estimatedMinutes} min
                  </p>
                </div>
              </div>
            ))}
          </div>

          {keyTasks.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
                cursor: "pointer",
                padding: "8px 0",
                display: "block",
                width: "100%",
                textAlign: "center",
              }}
            >
              {expanded ? "Show less ↑" : `+${keyTasks.length - 2} more tasks ↓`}
            </button>
          )}
        </div>
      )}

      {/* Bottom action bar */}
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          gap: "8px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          marginTop: "16px",
        }}
      >
        <button
          onClick={() => router.push(ROUTES.INSIGHTS)}
          style={{
            flex: 1,
            padding: "10px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "var(--radius-md)",
            color: "white",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
        >
          📅 View full schedule
        </button>

        <button
          onClick={() => router.push(ROUTES.FOCUS)}
          style={{
            flex: 1,
            padding: "10px",
            background: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "var(--aura-primary-dark)",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ⚡ Start first task
        </button>
      </div>
    </div>
  );
}