"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function addTask(title: string, options?: {
    cognitive_load_score?: number;
    due_date?: string;
    tags?: string[];
  }) {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, ...options }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        return data.task;
      }
    } catch (err) {
      console.error("Add task error:", err);
    }
    return null;
  }

  async function completeTask(taskId: string) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "completed" } : t
      )
    );
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
    } catch (err) {
      console.error("Complete task error:", err);
      fetchTasks(); // Revert on error
    }
  }

  async function deferTask(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "deferred" } : t
      )
    );
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "deferred" }),
      });
    } catch (err) {
      console.error("Defer task error:", err);
      fetchTasks();
    }
  }

  async function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete task error:", err);
      fetchTasks();
    }
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const deferredTasks = tasks.filter((t) => t.status === "deferred");

  return {
    tasks,
    loading,
    error,
    pendingTasks,
    completedTasks,
    deferredTasks,
    addTask,
    completeTask,
    deferTask,
    deleteTask,
    refresh: fetchTasks,
  };
}