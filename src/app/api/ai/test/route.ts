import { generateFast } from "@/lib/ai/groq";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await generateFast(
      "Say hello to AURA users in one warm sentence.",
      "You are AURA, a friendly AI companion."
    );

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}