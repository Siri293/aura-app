import { createClient } from "@/lib/supabase/server";
import { groq } from "@/lib/ai/groq";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/system";
import { AI_MODELS, AI_MAX_TOKENS } from "@/lib/utils/constants";
import type { ChatMessage } from "@/lib/ai/groq";

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "very early morning";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export async function POST(req: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userName =
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "there";

    // Parse request body
    const { messages } = await req.json() as { messages: ChatMessage[] };

    // Get latest emotion state
    const { data: emotionLog } = await supabase
      .from("emotion_logs")
      .select("emotion_state")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(1)
      .single();

    // Get pending task count
    const { count: pendingTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending");

    // Build system prompt with context
    const systemPrompt = buildChatSystemPrompt({
      userName,
      emotionState: emotionLog?.emotion_state ?? "neutral",
      timeOfDay: getTimeOfDay(),
      pendingTasks: pendingTasks ?? 0,
    });

    // Create streaming response
    const stream = await groq.chat.completions.create({
      model: AI_MODELS.PRIMARY,
      max_tokens: AI_MAX_TOKENS,
      temperature: 0.8,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    // Stream the response back
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}