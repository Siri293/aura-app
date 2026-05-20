import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last 7 days date range
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch emotion logs for last 7 days
    const { data: emotionLogs } = await supabase
      .from("emotion_logs")
      .select("emotion_state, stress_score, emotion_score, logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", sevenDaysAgo.toISOString())
      .order("logged_at", { ascending: true });

    // Fetch focus sessions for last 7 days
    const { data: focusSessions } = await supabase
      .from("focus_sessions")
      .select("actual_duration_minutes, focus_score, status, started_at")
      .eq("user_id", user.id)
      .gte("started_at", sevenDaysAgo.toISOString())
      .eq("status", "completed");

    // Fetch tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("status, created_at, updated_at")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString());

    // Fetch journal entries
    const { data: journals } = await supabase
      .from("journal_entries")
      .select("sentiment_label, sentiment_score, created_at")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString());

    // Build daily data for last 7 days
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }

    const dailyData = days.map((day) => {
      const dayEmotions = (emotionLogs ?? []).filter(
        (e) => e.logged_at.split("T")[0] === day
      );
      const dayFocus = (focusSessions ?? []).filter(
        (s) => s.started_at.split("T")[0] === day
      );
      const dayTasks = (tasks ?? []).filter(
        (t) => t.updated_at?.split("T")[0] === day && t.status === "completed"
      );

      const avgStress =
        dayEmotions.length > 0
          ? dayEmotions.reduce((s, e) => s + (e.stress_score ?? 0), 0) /
            dayEmotions.length
          : null;

      const focusMinutes = dayFocus.reduce(
        (s, f) => s + (f.actual_duration_minutes ?? 0),
        0
      );

      const label = new Date(day).toLocaleDateString("en-US", {
        weekday: "short",
      });

      return {
        date: day,
        label,
        avgStress: avgStress ? Math.round(avgStress) : null,
        focusMinutes,
        tasksCompleted: dayTasks.length,
        checkIns: dayEmotions.length,
      };
    });

    // Emotion distribution
    const emotionCounts: Record<string, number> = {};
    (emotionLogs ?? []).forEach((e) => {
      emotionCounts[e.emotion_state] =
        (emotionCounts[e.emotion_state] ?? 0) + 1;
    });

    // Summary stats
    const totalFocusMinutes = (focusSessions ?? []).reduce(
      (s, f) => s + (f.actual_duration_minutes ?? 0),
      0
    );
    const totalSessions = focusSessions?.length ?? 0;
    const totalTasksCompleted =
      tasks?.filter((t) => t.status === "completed").length ?? 0;
    const totalJournalEntries = journals?.length ?? 0;

    const avgStressWeek =
      (emotionLogs ?? []).length > 0
        ? Math.round(
            (emotionLogs ?? []).reduce(
              (s, e) => s + (e.stress_score ?? 0),
              0
            ) / (emotionLogs ?? []).length
          )
        : null;

    // Sentiment trend
    const sentimentData = (journals ?? []).map((j) => ({
      date: j.created_at.split("T")[0],
      label: j.sentiment_label,
      score: j.sentiment_score ?? 0,
    }));

    return NextResponse.json({
      success: true,
      dailyData,
      emotionCounts,
      sentimentData,
      summary: {
        totalFocusMinutes,
        totalSessions,
        totalTasksCompleted,
        totalJournalEntries,
        avgStressWeek,
        checkInStreak: (emotionLogs ?? []).length,
      },
    });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}