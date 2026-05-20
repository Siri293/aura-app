"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmotionState } from "@/lib/utils/constants";
import { EMOTION_CONFIG } from "@/lib/utils/constants";

interface EmotionLog {
  id: string;
  emotion_state: string;
  emotion_score: number;
  stress_score: number | null;
  logged_at: string;
}

interface TodayEmotions {
  latest: EmotionLog | null;
  logs: EmotionLog[];
  avgStress: number | null;
  checkInCount: number;
}

export function useEmotionLog() {
  const [todayData, setTodayData] = useState<TodayEmotions>({
    latest: null,
    logs: [],
    avgStress: null,
    checkInCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch("/api/emotion/today");
      const data = await res.json();
      if (data.success) {
        setTodayData({
          latest: data.latest,
          logs: data.logs,
          avgStress: data.avgStress,
          checkInCount: data.checkInCount,
        });
      }
    } catch (err) {
      console.error("Failed to fetch emotions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  async function logEmotion(
    emotionState: EmotionState,
    options?: { stressScore?: number }
  ) {
    try {
      // Map emotion state to a score
      const scoreMap: Record<EmotionState, number> = {
        focused: 85,
        happy: 80,
        neutral: 50,
        anxious: 35,
        stressed: 25,
        burned_out: 10,
      };

      // Map emotion to stress score
      const stressMap: Record<EmotionState, number> = {
        focused: 10,
        happy: 15,
        neutral: 30,
        anxious: 65,
        stressed: 75,
        burned_out: 85,
      };

      const res = await fetch("/api/emotion/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion_state: emotionState,
          emotion_score: scoreMap[emotionState],
          stress_score: options?.stressScore ?? stressMap[emotionState],
          inference_source: "self_report",
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Refresh today's data
        await fetchToday();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to log emotion:", err);
      return false;
    }
  }

  const currentEmotionState = todayData.latest?.emotion_state as EmotionState | null;
  const currentEmotionConfig = currentEmotionState
    ? EMOTION_CONFIG[currentEmotionState]
    : null;

  return {
    todayData,
    loading,
    logEmotion,
    refresh: fetchToday,
    currentEmotionState,
    currentEmotionConfig,
  };
}