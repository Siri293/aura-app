"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/lib/hooks/useUser";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const QUICK_REPLIES = [
  "How's my day looking?",
  "I'm feeling overwhelmed",
  "Help me prioritize",
  "I need a break",
  "What should I do next?",
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
        gap: "8px",
        alignItems: "flex-end",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "var(--aura-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "12px",
            fontWeight: "700",
            flexShrink: 0,
          }}
        >
          A
        </div>
      )}

      <div
        style={{
          maxWidth: "75%",
          padding: "12px 16px",
          borderRadius: isUser
            ? "18px 18px 4px 18px"
            : "18px 18px 18px 4px",
          background: isUser ? "var(--aura-primary)" : "var(--card-bg)",
          color: isUser ? "white" : "var(--text-primary)",
          fontSize: "14px",
          lineHeight: 1.6,
          border: isUser ? "none" : "0.5px solid var(--card-border)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {message.content}
        {message.isStreaming && (
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "14px",
              background: "var(--aura-primary)",
              marginLeft: "4px",
              verticalAlign: "middle",
              borderRadius: "1px",
              animation: "pulse-soft 1s ease-in-out infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function AuraChat() {
  const { displayName } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hey ${displayName || "there"} 👋 I'm AURA. How are you feeling today? I'm here to help you navigate your day.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (displayName) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "welcome"
            ? {
                ...m,
                content: `Hey ${displayName} 👋 I'm AURA. How are you feeling today? I'm here to help you navigate your day.`,
              }
            : m
        )
      );
    }
  }, [displayName]);

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: content.trim() }],
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data) as { text: string };
              accumulated += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: accumulated, isStreaming: true }
                    : m
                )
              );
            } catch {
              // skip
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Sorry, I had trouble connecting. Try again?",
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "var(--card-bg)",
          borderBottom: "0.5px solid var(--card-border)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--aura-primary), var(--aura-primary-dark))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "700",
            fontSize: "18px",
          }}
        >
          A
        </div>
        <div>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            AURA
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--success)",
              }}
            />
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
              Online · Your AI companion
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--aura-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              A
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: "var(--card-bg)",
                border: "0.5px solid var(--card-border)",
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--aura-primary)",
                    animation: `pulse-soft 1s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && (
        <div
          style={{
            padding: "0 24px 12px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => sendMessage(reply)}
              disabled={isLoading}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--aura-primary)",
                background: "transparent",
                color: "var(--aura-primary)",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--aura-primary)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--aura-primary)";
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        style={{
          padding: "12px 24px 20px",
          background: "var(--card-bg)",
          borderTop: "0.5px solid var(--card-border)",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Message AURA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "var(--radius-full)",
            border: "1.5px solid var(--card-border)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontSize: "14px",
            outline: "none",
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--aura-primary)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--card-border)")
          }
        />

        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background:
              input.trim() && !isLoading
                ? "var(--aura-primary)"
                : "var(--surface-secondary)",
            border: "none",
            color:
              input.trim() && !isLoading
                ? "white"
                : "var(--text-tertiary)",
            cursor:
              input.trim() && !isLoading ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}