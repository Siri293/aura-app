"use client";

import FocusTimer from "@/components/aura/FocusTimer";
import PageWrapper from "@/components/layout/PageWrapper";

export default function FocusPage() {
  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <PageWrapper>
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
              margin: "0 0 4px 0",
            }}
          >
            Focus Mode ⚡
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            Deep work sessions — distraction free
          </p>
        </div>

        <div className="aura-card" style={{ padding: "0" }}>
          <FocusTimer
            onSessionComplete={(minutes, score) => {
              console.log(`Session complete: ${minutes}min, score: ${score}`);
            }}
          />
        </div>
      </PageWrapper>
    </div>
  );
}