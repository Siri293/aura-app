"use client";

import { formatDate, getGreeting } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoodCheckin from "@/components/aura/MoodCheckin";
import WellnessSnapshot from "@/components/aura/WellnessSnapshot";
import TaskList from "@/components/aura/TaskList";
import MorningBrief from "@/components/aura/MorningBrief";
import QuickActions from "@/components/aura/QuickActions";
import PageWrapper from "@/components/layout/PageWrapper";
import { useUser } from "@/lib/hooks/useUser";
import { useMorningBrief } from "@/lib/hooks/useMorningBrief";
import { useEmotionLog } from "@/lib/hooks/useEmotionLog";
import type { EmotionState } from "@/lib/utils/constants";

export default function DashboardPage() {
  const today = formatDate(new Date());
  const greeting = getGreeting();
  const { displayName } = useUser();
  const { brief, loading: briefLoading, refresh } = useMorningBrief();
  const { todayData, logEmotion } = useEmotionLog();
  const [currentMood, setCurrentMood] = useState<EmotionState | null>(null);
  const [focusData, setFocusData] = useState({
    totalMinutes: 0,
    sessionCount: 0,
  });
  const [taskStats, setTaskStats] = useState({
    done: 0,
    total: 0,
  });

  // Fetch focus data
  useEffect(() => {
    fetch("/api/focus")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFocusData({
            totalMinutes: d.totalMinutes,
            sessionCount: d.sessionCount,
          });
        }
      })
      .catch(console.error);
  }, []);

  // Fetch task stats
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const done = d.tasks.filter(
            (t: { status: string }) => t.status === "completed"
          ).length;
          setTaskStats({ done, total: d.tasks.length });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <PageWrapper>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
              margin: "0 0 4px 0",
            }}
          >
            {greeting} 👋
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {today} · Here&apos;s your day at a glance
          </p>
        </div>
        <LiveClock />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Morning Brief */}
        <MorningBrief
          userName={brief?.userName ?? displayName}
          briefText={brief?.text}
          keyTasks={brief?.keyTasks}
          isLoading={briefLoading}
          onRefresh={refresh}
        />

        {/* Quick Actions */}
        <div className="aura-card animate-fade-in" style={{ padding: "24px" }}>
          <QuickActions />
        </div>

        {/* Mood Checkin */}
        <MoodCheckin
          onMoodSelect={(mood) => setCurrentMood(mood)}
          onMoodLogged={async (mood) => {
            setCurrentMood(mood);
            await logEmotion(mood);
          }}
          selectedMood={currentMood}
        />

        {/* Two column row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <FocusCard
            sessionCount={focusData.sessionCount}
            totalMinutes={focusData.totalMinutes}
          />
          <WellnessSnapshot
            stressScore={todayData.avgStress}
            focusMinutes={focusData.totalMinutes}
            tasksDone={taskStats.done}
            tasksTotal={taskStats.total}
            moodStreak={todayData.checkInCount}
          />
        </div>

        {/* Task List */}
        <TaskList />

        <div style={{ height: "16px" }} />
      </div>
    </PageWrapper>
  );
}

function LiveClock() {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );

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

  return (
    <div
      style={{
        padding: "8px 16px",
        background: "var(--card-bg)",
        border: "0.5px solid var(--card-border)",
        borderRadius: "var(--radius-full)",
        fontSize: "14px",
        fontWeight: "600",
        color: "var(--text-primary)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {time}
    </div>
  );
}

function FocusCard({
  sessionCount,
  totalMinutes,
}: {
  sessionCount: number;
  totalMinutes: number;
}) {
  const router = useRouter();

  return (
    <div className="aura-card" style={{ padding: "24px" }}>
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
        Focus Session
      </p>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div>
          <p
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {sessionCount}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              margin: "4px 0 0",
            }}
          >
            sessions today
          </p>
        </div>
        <div
          style={{
            width: "1px",
            background: "var(--border-default)",
            alignSelf: "stretch",
          }}
        />
        <div>
          <p
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: totalMinutes > 0
                ? "var(--emotion-focused)"
                : "var(--text-primary)",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {totalMinutes}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              margin: "4px 0 0",
            }}
          >
            min focused
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push("/focus")}
        style={{
          width: "100%",
          padding: "10px",
          background: "var(--aura-primary)",
          color: "white",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <span>⚡</span>
        {sessionCount > 0 ? "Start Another Session" : "Start Focus Session"}
      </button>
    </div>
  );
}