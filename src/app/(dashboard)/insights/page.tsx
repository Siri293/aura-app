"use client";

import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DailyData {
  date: string;
  label: string;
  avgStress: number | null;
  focusMinutes: number;
  tasksCompleted: number;
  checkIns: number;
}

interface Summary {
  totalFocusMinutes: number;
  totalSessions: number;
  totalTasksCompleted: number;
  totalJournalEntries: number;
  avgStressWeek: number | null;
  checkInStreak: number;
}

interface InsightsData {
  dailyData: DailyData[];
  emotionCounts: Record<string, number>;
  summary: Summary;
}

const EMOTION_COLORS: Record<string, string> = {
  focused:    "#2d5be3",
  happy:      "#57cc99",
  neutral:    "#6b7280",
  anxious:    "#c77dff",
  stressed:   "#f4a261",
  burned_out: "#e76f51",
};

const EMOTION_EMOJIS: Record<string, string> = {
  focused:    "⚡",
  happy:      "😊",
  neutral:    "😐",
  anxious:    "😟",
  stressed:   "😤",
  burned_out: "😮‍💨",
};

function StatCard({
  label,
  value,
  unit,
  emoji,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  emoji: string;
  color?: string;
}) {
  return (
    <div
      className="aura-card"
      style={{ padding: "20px", textAlign: "center" }}
    >
      <p style={{ fontSize: "24px", margin: "0 0 6px" }}>{emoji}</p>
      <p
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: color ?? "var(--text-primary)",
          margin: "0 0 4px",
          lineHeight: 1,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: "14px",
              color: "var(--text-tertiary)",
              fontWeight: "400",
              marginLeft: "4px",
            }}
          >
            {unit}
          </span>
        )}
      </p>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-tertiary)",
          margin: 0,
          fontWeight: "500",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p
      style={{
        fontSize: "12px",
        color: "var(--text-tertiary)",
        fontWeight: "600",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        margin: "0 0 16px",
      }}
    >
      {title}
    </p>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ overflowY: "auto", height: "100%" }}>
        <PageWrapper>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: "200px", borderRadius: "var(--radius-lg)" }}
              />
            ))}
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ overflowY: "auto", height: "100%" }}>
        <PageWrapper>
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-tertiary)" }}>
            <p style={{ fontSize: "32px" }}>📊</p>
            <p>Failed to load insights. Please refresh.</p>
          </div>
        </PageWrapper>
      </div>
    );
  }

  const { dailyData, emotionCounts, summary } = data;

  // Emotion pie chart data
  const pieData = Object.entries(emotionCounts).map(([name, value]) => ({
    name,
    value,
    color: EMOTION_COLORS[name] ?? "#6b7280",
    emoji: EMOTION_EMOJIS[name] ?? "😐",
  }));

  // Stress color
  function stressColor(score: number | null): string {
    if (!score) return "var(--text-primary)";
    if (score >= 75) return "var(--danger)";
    if (score >= 50) return "var(--warning)";
    return "var(--success)";
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
            Insights 📊
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            Your last 7 days — patterns, trends, and progress
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Summary stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            <StatCard
              emoji="⚡"
              label="Focus minutes"
              value={summary.totalFocusMinutes}
              unit="min"
              color="var(--emotion-focused)"
            />
            <StatCard
              emoji="🎯"
              label="Sessions done"
              value={summary.totalSessions}
              color="var(--aura-primary)"
            />
            <StatCard
              emoji="✅"
              label="Tasks completed"
              value={summary.totalTasksCompleted}
              color="var(--success)"
            />
            <StatCard
              emoji="📓"
              label="Journal entries"
              value={summary.totalJournalEntries}
              color="#7c5cbb"
            />
            <StatCard
              emoji="😤"
              label="Avg stress"
              value={summary.avgStressWeek ?? "--"}
              unit={summary.avgStressWeek ? "/100" : ""}
              color={stressColor(summary.avgStressWeek)}
            />
            <StatCard
              emoji="🔥"
              label="Mood check-ins"
              value={summary.checkInStreak}
              color="var(--warning)"
            />
          </div>

          {/* Focus minutes chart */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionTitle title="Daily Focus Minutes" />
            {dailyData.some((d) => d.focusMinutes > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-default)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                    unit="m"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-bg)",
                      border: "0.5px solid var(--card-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [`${value} min`, "Focus"]}
                  />
                  <Bar
                    dataKey="focusMinutes"
                    fill="var(--aura-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)" }}>
                <p style={{ fontSize: "24px", margin: "0 0 8px" }}>⚡</p>
                <p style={{ fontSize: "14px" }}>No focus sessions yet this week. Start one!</p>
              </div>
            )}
          </div>

          {/* Stress trend chart */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionTitle title="Stress Level Trend" />
            {dailyData.some((d) => d.avgStress !== null) ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-default)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-bg)",
                      border: "0.5px solid var(--card-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [`${value}/100`, "Stress"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgStress"
                    stroke="var(--warning)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--warning)", r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)" }}>
                <p style={{ fontSize: "24px", margin: "0 0 8px" }}>😊</p>
                <p style={{ fontSize: "14px" }}>Log your mood daily to see stress trends.</p>
              </div>
            )}
          </div>

          {/* Tasks completed chart */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionTitle title="Tasks Completed Per Day" />
            {dailyData.some((d) => d.tasksCompleted > 0) ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-default)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-bg)",
                      border: "0.5px solid var(--card-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [`${value} tasks`, "Completed"]}
                  />
                  <Bar
                    dataKey="tasksCompleted"
                    fill="var(--success)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)" }}>
                <p style={{ fontSize: "24px", margin: "0 0 8px" }}>✅</p>
                <p style={{ fontSize: "14px" }}>Complete tasks to see your productivity trend.</p>
              </div>
            )}
          </div>

          {/* Emotion distribution */}
          {pieData.length > 0 && (
            <div className="aura-card" style={{ padding: "24px" }}>
              <SectionTitle title="Mood Distribution This Week" />
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <PieChart width={160} height={160}>
                  <Pie
                    data={pieData}
                    cx={80}
                    cy={80}
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>

                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                  }}
                >
                  {pieData.map((item) => (
                    <div
                      key={item.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {item.emoji} {item.name}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        {item.value}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AURA weekly insight */}
          <div
            className="aura-card"
            style={{
              padding: "24px",
              background:
                "linear-gradient(135deg, var(--aura-primary) 0%, var(--aura-primary-dark) 100%)",
              color: "white",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                opacity: 0.75,
                fontWeight: "600",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              ✨ AURA Weekly Insight
            </p>
            <p style={{ fontSize: "15px", lineHeight: 1.7, margin: 0, opacity: 0.95 }}>
              {summary.totalFocusMinutes > 0
                ? `You focused for ${summary.totalFocusMinutes} minutes this week across ${summary.totalSessions} session${summary.totalSessions !== 1 ? "s" : ""}. `
                : ""}
              {summary.totalTasksCompleted > 0
                ? `You completed ${summary.totalTasksCompleted} task${summary.totalTasksCompleted !== 1 ? "s" : ""}. `
                : ""}
              {summary.avgStressWeek !== null
                ? summary.avgStressWeek < 40
                  ? "Your stress levels look healthy — keep it up! 🌟"
                  : summary.avgStressWeek < 70
                  ? "Moderate stress this week. Remember to take breaks."
                  : "High stress detected. Consider lighter tasks and more breaks."
                : "Keep logging your mood daily so AURA can spot patterns for you."}
            </p>
          </div>

          <div style={{ height: "32px" }} />
        </div>
      </PageWrapper>
    </div>
  );
}