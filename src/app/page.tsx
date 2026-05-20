import { APP_NAME } from "@/lib/utils/constants";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--aura-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          color: "white",
          fontWeight: "600",
          boxShadow: "var(--shadow-card)",
        }}
      >
        A
      </div>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "600",
          color: "var(--text-primary)",
          letterSpacing: "-0.5px",
        }}
      >
        {APP_NAME}
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "var(--text-secondary)",
          textAlign: "center",
          maxWidth: "320px",
        }}
      >
        Your emotionally intelligent AI life companion
      </p>
      <div
        style={{
          marginTop: "8px",
          padding: "8px 20px",
          background: "var(--aura-primary)",
          color: "white",
          borderRadius: "var(--radius-full)",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Building...
      </div>
    </main>
  );
}