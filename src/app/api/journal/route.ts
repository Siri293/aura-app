import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeSentiment } from "@/lib/ai/sentiment";
import { generateFast } from "@/lib/ai/groq";

// GET — fetch journal entries
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select("id, content, sentiment_score, sentiment_label, ai_reflection, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ success: true, entries: entries ?? [] });
  } catch (error) {
    console.error("Journal GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

// POST — create journal entry with sentiment analysis
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Run sentiment analysis
    const sentiment = await analyzeSentiment(content);

    // Generate AI reflection
    const userName =
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "there";

    const reflection = await generateFast(
      `The user wrote this journal entry: "${content.slice(0, 300)}"
      
      Write a single warm, empathetic response (1-2 sentences max) that:
      - Acknowledges what they shared
      - Offers a gentle, supportive perspective
      - Never gives advice unless asked
      - Sounds like a caring friend, not a therapist
      
      The sentiment is ${sentiment.label}. Be appropriately warm.`,
      "You are AURA, an emotionally intelligent AI companion. Be brief and warm."
    );

    // Save to Supabase
    const { data: entry, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        content: content.trim(),
        sentiment_score: sentiment.normalizedScore,
        sentiment_label: sentiment.label,
        ai_reflection: reflection,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      entry,
      sentiment,
    });
  } catch (error) {
    console.error("Journal POST error:", error);
    return NextResponse.json(
      { error: "Failed to save entry" },
      { status: 500 }
    );
  }
}