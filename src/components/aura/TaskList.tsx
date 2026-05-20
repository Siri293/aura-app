"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";
import { useTasks } from "@/lib/hooks/useTasks";
import { TASK_STATUS } from "@/lib/utils/constants";

export default function TaskList() {
  const {
    tasks,
    loading,
    pendingTasks,
    completedTasks,
    addTask,
    completeTask,
    deferTask,
    deleteTask,
  } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddTask() {
    if (!newTaskTitle.trim() || isAdding) return;
    setIsAdding(true);
    await addTask(newTaskTitle.trim());
    setNewTaskTitle("");
    setShowInput(false);
    setIsAdding(false);
  }

  return (
    <div className="aura-card" style={{ padding: "24px" }}>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              fontWeight: "500",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              margin: "0 0 2px 0",
            }}
          >
            Tasks
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
            {loading
              ? "Loading..."
              : `${completedTasks.length}/${tasks.filter(t => t.status !== TASK_STATUS.DEFERRED).length} completed today`}
          </p>
        </div>

        <button
          onClick={() => setShowInput(true)}
          style={{
            padding: "8px 16px",
            background: "var(--aura-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-full)",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
          Add Task
        </button>
      </div>

      {/* Add Task Input */}
      {showInput && (
        <div
          className="animate-slide-up"
          style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
        >
          <input
            autoFocus
            type="text"
            placeholder="What do you need to do?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
              if (e.key === "Escape") {
                setShowInput(false);
                setNewTaskTitle("");
              }
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--aura-primary)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim() || isAdding}
            style={{
              padding: "10px 16px",
              background: newTaskTitle.trim()
                ? "var(--aura-primary)"
                : "var(--surface-secondary)",
              color: newTaskTitle.trim() ? "white" : "var(--text-tertiary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              fontWeight: "500",
              cursor: newTaskTitle.trim() ? "pointer" : "not-allowed",
            }}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
          <button
            onClick={() => {
              setShowInput(false);
              setNewTaskTitle("");
            }}
            style={{
              padding: "10px 14px",
              background: "transparent",
              color: "var(--text-tertiary)",
              border: "0.5px solid var(--card-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "56px", borderRadius: "var(--radius-md)" }}
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)" }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>✅</p>
          <p style={{ fontSize: "14px" }}>No tasks yet. Add one to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Pending tasks */}
          {pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={completeTask}
              onDefer={deferTask}
              onDelete={deleteTask}
            />
          ))}

          {/* Divider */}
          {pendingTasks.length > 0 && completedTasks.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "4px 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "var(--border-default)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                Completed
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-default)" }} />
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={completeTask}
              onDefer={deferTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}