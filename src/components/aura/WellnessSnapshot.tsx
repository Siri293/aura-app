"use client";

interface StatItem {
  label: string;
  value: string | number;
  unit: string;
  color?: string;
}

interface WellnessSnapshotProps {
  stressScore?: number | null;
  focusMinutes?: number;
  tasksDone?: number;
  tasksTotal?: number;
  moodStreak?: number;
}

function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div
      style={{
        flex: "1",
        minWidth: "100px",
        padding: "14px",
        background: "var(--surface-secondary)",
        borderRadius: "var(--radius-md)",
        border: "0.5px solid var(--card-border)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          color: "var(--text-tertiary)",
          marginBottom: "6px",
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          margin: "0 0 6px 0",
        }}
      >
        {stat.label}
      </p>
      <p
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color: stat.color ?? "var(--text-primary)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {stat.value}
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-tertiary)",
            fontWeight: "400",
            marginLeft: "3px",
          }}
        >
          {stat.unit}
        </span>
      </p>
    </div>
  );
}

export default function WellnessSnapshot({
  stressScore = null,
  focusMinutes = 0,
  tasksDone = 0,
  tasksTotal = 0,
  moodStreak = 0,
}: WellnessSnapshotProps) {
  function getStressColor(score: number | null): string {
    if (score === null) return "var(--text-primary)";
    if (score >= 75) return "var(--danger)";
    if (score >= 50) return "var(--warning)";
    return "var(--success)";
  }

  function getStressLabel(score: number | null): string {
    if (score === null) return "--";
    if (score >= 75) return "High";
    if (score >= 50) return "Moderate";
    return "Low";
  }

  const stats: StatItem[] = [
    {
      label: "Stress",
      value: stressScore !== null ? getStressLabel(stressScore) : "--",
      unit: stressScore !== null ? `${stressScore}/100` : "",
      color: getStressColor(stressScore),
    },
    {
      label: "Focus",
      value: focusMinutes,
      unit: "min",
      color:
        focusMinutes > 0 ? "var(--emotion-focused)" : "var(--text-primary)",
    },
    {
      label: "Tasks",
      value:
        tasksTotal > 0 ? `${tasksDone}/${tasksTotal}` : tasksDone,
      unit: "done",
      color:
        tasksTotal > 0 && tasksDone === tasksTotal
          ? "var(--success)"
          : "var(--text-primary)",
    },
    {
      label: "Check-ins",
      value: moodStreak,
      unit: "today",
      color: moodStreak >= 2 ? "var(--success)" : "var(--text-primary)",
    },
  ];

  return (
    <div className="aura-card" style={{ padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-tertiary)",
            fontWeight: "500",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Wellness Snapshot
        </p>
        <div
          style={{
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            background: "var(--aura-primary-light)",
            fontSize: "11px",
            fontWeight: "600",
            color: "var(--aura-primary)",
          }}
        >
          {stressScore === null
            ? "Warming up..."
            : `Score: ${100 - stressScore}/100`}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Focus progress bar */}
      <div style={{ marginTop: "14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
            Daily focus goal
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              fontWeight: "500",
            }}
          >
            {focusMinutes} / 120 min
          </span>
        </div>
        <div
          style={{
            height: "5px",
            background: "var(--surface-secondary)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min((focusMinutes / 120) * 100, 100)}%`,
              background:
                focusMinutes >= 120
                  ? "var(--success)"
                  : "var(--aura-primary)",
              borderRadius: "var(--radius-full)",
              transition: "width var(--transition-slow)",
            }}
          />
        </div>
      </div>
    </div>
  );
}