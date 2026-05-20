import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST — start or end a focus session
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, session_id, planned_duration_minutes, actual_duration_minutes, focus_score, ambient_sound, status } = body;

    if (action === "start") {
      const { data, error } = await supabase
        .from("focus_sessions")
        .insert({
          user_id: user.id,
          planned_duration_minutes: planned_duration_minutes ?? 45,
          ambient_sound: ambient_sound ?? "none",
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, session: data });
    }

    if (action === "end" && session_id) {
      const { data, error } = await supabase
        .from("focus_sessions")
        .update({
          actual_duration_minutes,
          focus_score,
          status: status ?? "completed",
          ended_at: new Date().toISOString(),
        })
        .eq("id", session_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, session: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Focus session error:", error);
    return NextResponse.json(
      { error: "Failed to process focus session" },
      { status: 500 }
    );
  }
}

// GET — fetch today's focus sessions
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sessions, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("started_at", today.toISOString())
      .order("started_at", { ascending: false });

    if (error) throw error;

    const totalMinutes = sessions
      ?.filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + (s.actual_duration_minutes ?? 0), 0) ?? 0;

    return NextResponse.json({
      success: true,
      sessions: sessions ?? [],
      totalMinutes,
      sessionCount: sessions?.length ?? 0,
    });
  } catch (error) {
    console.error("Focus GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}