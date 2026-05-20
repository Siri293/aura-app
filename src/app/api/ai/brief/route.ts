import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/ai/groq";
import { buildMorningBriefPrompt, AURA_SYSTEM_PROMPT } from "@/lib/ai/prompts/system";

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "very early morning";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function getDayOfWeek(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user display name
    const userName =
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "there";

    // Get today's tasks from Supabase
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, priority_score, cognitive_load_score, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "in_progress"])
      .order("priority_score", { ascending: false })
      .limit(5);

    // Get today's emotion log
    const { data: emotionLog } = await supabase
      .from("emotion_logs")
      .select("emotion_state")
      .eq("user_id", user.id)
      .gte("logged_at", today.toISOString())
      .order("logged_at", { ascending: false })
      .limit(1)
      .single();

    const emotionState = emotionLog?.emotion_state ?? "neutral";
    const topTasks = tasks?.map((t) => t.title) ?? [];
    const taskCount = tasks?.length ?? 0;

    // Build prompt
    const userPrompt = buildMorningBriefPrompt({
      userName,
      timeOfDay: getTimeOfDay(),
      taskCount,
      topTasks: topTasks.slice(0, 3),
      emotionState,
      dayOfWeek: getDayOfWeek(),
    });

    // Generate with Groq
    const briefText = await generateCompletion([
      { role: "system", content: AURA_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ], {
      temperature: 0.8,
      maxTokens: 150,
    });

    // Build key tasks for display
    const keyTasks = (tasks ?? []).slice(0, 3).map((task, index) => ({
      id: String(index + 1),
      title: task.title,
      estimatedMinutes: (task.cognitive_load_score ?? 2) * 20,
      priority: index === 0 ? "high" : index === 1 ? "medium" : "low" as "high" | "medium" | "low",
    }));

    return NextResponse.json({
      success: true,
      brief: {
        text: briefText,
        userName,
        keyTasks,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Brief generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    );
  }
}