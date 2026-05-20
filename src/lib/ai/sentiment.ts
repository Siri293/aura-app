const HF_API_URL =
  "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";

interface HFResult {
  label: "POSITIVE" | "NEGATIVE";
  score: number;
}

export async function analyzeSentiment(text: string): Promise<{
  label: "positive" | "negative" | "neutral";
  score: number;
  normalizedScore: number;
}> {
  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text.slice(0, 512) }),
    });

    if (!res.ok) {
      console.error("HF API status:", res.status);
      throw new Error(`HF API error: ${res.status}`);
    }

    const raw = await res.json();

    // HF returns [[{label, score}, {label, score}]]
    // Find the result with highest score
    const results: HFResult[] = Array.isArray(raw[0]) ? raw[0] : raw;

    // Find positive and negative scores
    const positiveResult = results.find((r) => r.label === "POSITIVE");
    const negativeResult = results.find((r) => r.label === "NEGATIVE");

    const positiveScore = positiveResult?.score ?? 0;
    const negativeScore = negativeResult?.score ?? 0;

    // Determine label with better thresholds
    let label: "positive" | "negative" | "neutral";
    let normalizedScore: number;

    if (positiveScore > 0.65) {
      label = "positive";
      normalizedScore = positiveScore;
    } else if (negativeScore > 0.65) {
      label = "negative";
      normalizedScore = -negativeScore;
    } else {
      label = "neutral";
      normalizedScore = positiveScore - negativeScore;
    }

    return {
      label,
      score: Math.max(positiveScore, negativeScore),
      normalizedScore,
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);

    // Fallback: use simple keyword analysis
    return fallbackSentiment(text);
  }
}

// Simple keyword-based fallback when HF API fails
function fallbackSentiment(text: string): {
  label: "positive" | "negative" | "neutral";
  score: number;
  normalizedScore: number;
} {
  const lower = text.toLowerCase();

  const positiveWords = [
    "happy", "great", "amazing", "good", "wonderful", "excited",
    "proud", "love", "fantastic", "excellent", "joy", "glad",
    "grateful", "thankful", "accomplished", "success", "win",
    "better", "improve", "progress", "achieved", "completed",
  ];

  const negativeWords = [
    "sad", "bad", "terrible", "awful", "overwhelmed", "stressed",
    "anxious", "worried", "tired", "exhausted", "frustrated",
    "angry", "upset", "depressed", "struggling", "difficult",
    "hate", "worst", "fail", "lost", "confused", "alone",
  ];

  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;

  if (posCount > negCount && posCount > 0) {
    return { label: "positive", score: 0.7, normalizedScore: 0.7 };
  } else if (negCount > posCount && negCount > 0) {
    return { label: "negative", score: 0.7, normalizedScore: -0.7 };
  }
  return { label: "neutral", score: 0.5, normalizedScore: 0 };
}