"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/utils/constants";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  // Basic validation
  if (!email || !password) {
    setError("Please fill in all fields.");
    setLoading(false);
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    setLoading(false);
    return;
  }

  try {
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: name || email.split("@")[0],
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setSuccess("Account created! Taking you to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Make error messages user-friendly
      const msg = err.message;
      if (msg.includes("Invalid login credentials")) {
        setError("Wrong email or password. Please try again.");
      } else if (msg.includes("User already registered")) {
        setError("This email is already registered. Try signing in.");
      } else if (msg.includes("Invalid path")) {
        setError("Configuration error. Check your Supabase URL in .env.local");
      } else {
        setError(msg);
      }
    } else {
      setError("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--surface)",
      }}
    >
      {/* Left panel — branding */}
      <div
        style={{
          flex: 1,
          background:
            "linear-gradient(135deg, var(--aura-primary) 0%, var(--aura-primary-dark) 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          color: "white",
        }}
        className="login-panel-left"
      >
        {/* Logo */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "24px",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          A
        </div>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            marginBottom: "16px",
            letterSpacing: "-1px",
          }}
        >
          {APP_NAME}
        </h1>

        <p
          style={{
            fontSize: "16px",
            opacity: 0.85,
            textAlign: "center",
            maxWidth: "320px",
            lineHeight: 1.7,
            marginBottom: "48px",
          }}
        >
          Your emotionally intelligent AI life companion — designed for Gen Z.
        </p>

        {/* Feature list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {[
            { emoji: "🧠", text: "AI that understands how you feel" },
            { emoji: "⚡", text: "Smart focus sessions & scheduling" },
            { emoji: "📊", text: "Wellness insights & stress detection" },
            { emoji: "🔒", text: "Private, secure, always yours" },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-md)",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ fontSize: "20px" }}>{item.emoji}</span>
              <span style={{ fontSize: "14px", opacity: 0.9 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          width: "480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          background: "var(--card-bg)",
        }}
        className="login-panel-right"
      >
        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--surface-secondary)",
            borderRadius: "var(--radius-full)",
            padding: "4px",
            marginBottom: "32px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
                setSuccess(null);
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: mode === m ? "var(--card-bg)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-tertiary)",
                fontWeight: mode === m ? "600" : "400",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                boxShadow: mode === m ? "var(--shadow-soft)" : "none",
              }}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "32px", width: "100%" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            {mode === "signin" ? "Welcome back 👋" : "Create your account ✨"}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            {mode === "signin"
              ? "Sign in to continue with AURA"
              : "Start your journey with AURA today"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Name field — signup only */}
          {mode === "signup" && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Your name
              </label>
              <input
                type="text"
                placeholder="Arya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--card-border)",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color var(--transition-fast)",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--aura-primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--card-border)")
                }
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--card-border)",
                background: "var(--surface)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color var(--transition-fast)",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--aura-primary)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--card-border)")
              }
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--card-border)",
                background: "var(--surface)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color var(--transition-fast)",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--aura-primary)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--card-border)")
              }
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--danger-bg)",
                border: "1px solid var(--danger)",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                color: "var(--danger)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--success-bg)",
                border: "1px solid var(--success)",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                color: "var(--success)",
              }}
            >
              ✅ {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading ? "var(--text-tertiary)" : "var(--aura-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all var(--transition-fast)",
              marginTop: "4px",
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        {/* Footer note */}
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-tertiary)",
            textAlign: "center",
            marginTop: "24px",
            maxWidth: "280px",
            lineHeight: 1.6,
          }}
        >
          By continuing, you agree that AURA will use your data to personalize
          your experience. Your data is never sold.
        </p>
      </div>
    </div>
  );
}