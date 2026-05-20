"use client";

import { useState, useEffect } from "react";

interface BriefTask {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
}

interface BriefData {
  text: string;
  userName: string;
  keyTasks: BriefTask[];
  generatedAt: string;
}

export function useMorningBrief() {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBrief() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/brief");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to fetch brief");

      setBrief(data.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBrief();
  }, []);

  return { brief, loading, error, refresh: fetchBrief };
}