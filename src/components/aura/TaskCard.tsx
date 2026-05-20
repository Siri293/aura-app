"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  COGNITIVE_LOAD_LABELS,
  TASK_STATUS,
} from "@/lib/utils/constants";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onDefer?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

function CognitiveLoadDots({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background:
              dot <= score
                ? score >= 4
                  ? "var(--danger)"
                  : score >= 3
                  ? "var(--warning)"
                  : "var(--aura-primary)"
                : "var(--border-default)",
          }}
        />
      ))}
    </div>
  );
}

export default function TaskCard({
  task,
  onComplete,
  onDefer,
  onDelete,
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);
  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const isDeferred = task.status === TASK_STATUS.DEFERRED;

  // Format due date
  function formatDue(dateStr?: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return "Overdue";
    if (diffHours < 1) return "Due soon";
    if (diffHours < 24) return `Due in ${diffHours}h`;
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  }

  const dueLabel = formatDue(task.due_date);
  const isOverdue = dueLabel === "Overdue";

  return (
    <div
      className="aura-card"
      style={{
        padding: "16px 20px",
        opacity: isCompleted || isDeferred ? 0.6 : 1,
        transition: "all var(--transition-base)",
        borderLeft: `3px solid ${
          isCompleted
            ? "var(--success)"
            : isDeferred
            ? "var(--text-tertiary)"
            : isOverdue
            ? "var(--danger)"
            : "var(--aura-primary)"
        }`,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>

        {/* Checkbox */}
        <button
          onClick={() => !isCompleted && onComplete?.(task.id)}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: isCompleted
              ? "none"
              : "2px solid var(--border-strong)",
            background: isCompleted ? "var(--success)" : "transparent",
            cursor: isCompleted ? "default" : "pointer",
            flexShrink: 0,
            marginTop: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
          aria-label={isCompleted ? "Completed" : "Mark complete"}
        >
          {isCompleted && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "var(--text-primary)",
              margin: "0 0 6px 0",
              textDecoration: isCompleted ? "line-through" : "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.title}
          </p>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>

            {/* Cognitive load */}
            {task.cognitive_load_score && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <CognitiveLoadDots score={task.cognitive_load_score} />
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  {COGNITIVE_LOAD_LABELS[task.cognitive_load_score as keyof typeof COGNITIVE_LOAD_LABELS]}
                </span>
              </div>
            )}

            {/* Due date */}
            {dueLabel && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  color: isOverdue ? "var(--danger)" : "var(--text-tertiary)",
                  background: isOverdue ? "var(--danger-bg)" : "transparent",
                  padding: isOverdue ? "2px 6px" : "0",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {dueLabel}
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  background: "var(--aura-primary-light)",
                  color: "var(--aura-primary)",
                  borderRadius: "var(--radius-full)",
                  fontWeight: "500",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            opacity: showActions ? 1 : 0,
            transition: "opacity var(--transition-fast)",
            flexShrink: 0,
          }}
        >
          {/* Defer */}
          {!isCompleted && !isDeferred && (
            <button
              onClick={() => onDefer?.(task.id)}
              title="Defer task"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                border: "0.5px solid var(--card-border)",
                background: "var(--surface-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-tertiary)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete?.(task.id)}
            title="Delete task"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              border: "0.5px solid var(--card-border)",
              background: "var(--surface-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-tertiary)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}