"use client";

import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";

interface JournalEntry {
  id: string;
  content: string;
  sentiment_score: number | null;
  sentiment_label: string | null;
  ai_reflection: string | null;
  created_at: string;
}

function SentimentBadge({ label }: { label: string | null }) {
  if (!label) return null;

  const config = {
    positive: { color: "var(--success)", bg: "var(--success-bg)", emoji: "😊" },
    negative: { color: "var(--danger)", bg: "var(--danger-bg)", emoji: "😔" },
    neutral:  { color: "var(--text-secondary)", bg: "var(--surface-secondary)", emoji: "😐" },
  };

  const c = config[label as keyof typeof config] ?? config.neutral;

  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: "var(--radius-full)",
        background: c.bg,
        color: c.color,
        fontSize: "12px",
        fontWeight: "500",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {c.emoji} {label}
    </span>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(entry.created_at);

  return (
    <div className="aura-card animate-fade-in" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
          gap: "12px",
        }}
      >
        <div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            · {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
        <SentimentBadge label={entry.sentiment_label} />
      </div>

      <p
        style={{
          fontSize: "14px",
          color: "var(--text-primary)",
          lineHeight: 1.7,
          margin: "0 0 12px 0",
        }}
      >
        {expanded || entry.content.length <= 150
          ? entry.content
          : entry.content.slice(0, 150) + "..."}
        {entry.content.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              color: "var(--aura-primary)",
              cursor: "pointer",
              fontSize: "13px",
              marginLeft: "4px",
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      {entry.ai_reflection && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--aura-primary-light)",
            borderRadius: "var(--radius-md)",
            borderLeft: "3px solid var(--aura-primary)",
          }}
        >
          <p style={{ fontSize: "12px", color: "var(--aura-primary)", margin: "0 0 4px", fontWeight: "600" }}>
            AURA reflects
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            {entry.ai_reflection}
          </p>
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setEntries(data.entries);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!content.trim() || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (data.success) {
        setEntries((prev) => [data.entry, ...prev]);
        setContent("");
        setCharCount(0);
      }
    } catch (err) {
      console.error("Save journal error:", err);
    } finally {
      setSaving(false);
    }
  }

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
            Journal 📓
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            Write freely — AURA listens without judgment
          </p>
        </div>

        {/* Write new entry */}
        <div className="aura-card" style={{ padding: "24px", marginBottom: "24px" }}>
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
            New Entry
          </p>

          <textarea
            placeholder="What's on your mind today? How are you feeling? What happened?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setCharCount(e.target.value.length);
            }}
            rows={5}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--card-border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontSize: "14px",
              lineHeight: 1.7,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color var(--transition-fast)",
              boxSizing: "border-box",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--aura-primary)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--card-border)")
            }
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
            }}
          >
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
              {charCount > 0 && `${charCount} characters · `}
              AURA will analyze your mood and respond warmly
            </p>

            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              style={{
                padding: "10px 24px",
                background:
                  content.trim() && !saving
                    ? "var(--aura-primary)"
                    : "var(--surface-secondary)",
                color:
                  content.trim() && !saving
                    ? "white"
                    : "var(--text-tertiary)",
                border: "none",
                borderRadius: "var(--radius-full)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: content.trim() && !saving ? "pointer" : "not-allowed",
                transition: "all var(--transition-fast)",
              }}
            >
              {saving ? "AURA is reading... ✨" : "Save Entry"}
            </button>
          </div>
        </div>

        {/* Past entries */}
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              fontWeight: "500",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Past Entries ({entries.length})
          </p>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: "120px", borderRadius: "var(--radius-lg)" }}
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-tertiary)",
              }}
            >
              <p style={{ fontSize: "32px", marginBottom: "8px" }}>📓</p>
              <p style={{ fontSize: "14px" }}>
                No entries yet. Write your first one above.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        <div style={{ height: "32px" }} />
      </PageWrapper>
    </div>
  );
}