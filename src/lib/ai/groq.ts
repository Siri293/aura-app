import Groq from "groq-sdk";
import { AI_MODELS, AI_MAX_TOKENS } from "@/lib/utils/constants";

// Singleton client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ── Standard completion (non-streaming) ──────────
export async function generateCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: options?.model ?? AI_MODELS.PRIMARY,
    max_tokens: options?.maxTokens ?? AI_MAX_TOKENS,
    temperature: options?.temperature ?? 0.7,
    messages,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ── Streaming completion ─────────────────────────
export async function generateStreamingCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
) {
  const stream = await groq.chat.completions.create({
    model: options?.model ?? AI_MODELS.PRIMARY,
    max_tokens: options?.maxTokens ?? AI_MAX_TOKENS,
    temperature: options?.temperature ?? 0.7,
    messages,
    stream: true,
  });

  return stream;
}

// ── Fast model for simple tasks ──────────────────
export async function generateFast(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  return generateCompletion(messages, {
    model: AI_MODELS.FAST,
    maxTokens: 500,
    temperature: 0.5,
  });
}