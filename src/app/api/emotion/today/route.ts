import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: logs, error } = await supabase
      .from("emotion_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", today.toISOString())
      .order("logged_at", { ascending: false });

    if (error) throw error;

    const latest = logs?.[0] ?? null;

    const avgStress =
      logs && logs.length > 0
        ? logs.reduce((sum, log) => sum + (log.stress_score ?? 0), 0) /
          logs.length
        : null;

    return NextResponse.json({
      success: true,
      latest,
      logs: logs ?? [],
      avgStress: avgStress ? Math.round(avgStress) : null,
      checkInCount: logs?.length ?? 0,
    });
  } catch (error) {
    console.error("Emotion today error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emotions" },
      { status: 500 }
    );
  }
}