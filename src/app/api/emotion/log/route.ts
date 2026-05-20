import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { emotion_state, emotion_score, stress_score, inference_source } = body;

    const validStates = [
      "focused", "neutral", "stressed",
      "burned_out", "anxious", "happy",
    ];

    if (!validStates.includes(emotion_state)) {
      return NextResponse.json(
        { error: "Invalid emotion state" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("emotion_logs")
      .insert({
        user_id: user.id,
        emotion_state,
        emotion_score: emotion_score ?? 50,
        stress_score: stress_score ?? null,
        inference_source: inference_source ?? "self_report",
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, log: data });
  } catch (error) {
    console.error("Emotion log error:", error);
    return NextResponse.json(
      { error: "Failed to log emotion" },
      { status: 500 }
    );
  }
}