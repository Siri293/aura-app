"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { useSignOut } from "@/lib/hooks/useSignOut";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  FOCUS_DURATIONS,
  BREAK_DURATIONS,
  DEFAULT_FOCUS_DURATION,
  DEFAULT_BREAK_DURATION,
} from "@/lib/utils/constants";

const AMBIENT_OPTIONS = [
  { id: "none",       label: "No sound",    emoji: "🔇" },
  { id: "lofi",       label: "Lo-fi beats", emoji: "🎵" },
  { id: "rain",       label: "Rain",        emoji: "🌧️" },
  { id: "whitenoise", label: "White noise", emoji: "〰️" },
  { id: "forest",     label: "Forest",      emoji: "🌿" },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "var(--text-primary)",
          margin: "0 0 4px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, displayName } = useUser();
  const { signOut } = useSignOut();
  const supabase = createClient();

  const [name, setName] = useState(displayName);
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);
  const [ambientSound, setAmbientSound] = useState("lofi");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (displayName) setName(displayName);
  }, [displayName]);

  async function handleSave() {
    if (!user || saving) return;
    setSaving(true);
    setSaved(false);

    try {
      // Update display name in auth metadata
      await supabase.auth.updateUser({
        data: { display_name: name },
      });

      // Upsert preferences
      await supabase.from("user_preferences").upsert({
        user_id: user.id,
        display_name: name,
        focus_duration_minutes: focusDuration,
        break_duration_minutes: breakDuration,
        preferred_ambient_sound: ambientSound,
        notification_quiet_hours_start: quietStart,
        notification_quiet_hours_end: quietEnd,
        updated_at: new Date().toISOString(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <PageWrapper>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
              margin: "0 0 4px 0",
            }}
          >
            Settings ⚙️
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            Personalize your AURA experience
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Profile */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionHeader
              title="Profile"
              subtitle="How AURA addresses you"
            />

            {/* Avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--aura-primary), var(--aura-primary-dark))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "700",
                }}
              >
                {name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    margin: "0 0 2px",
                  }}
                >
                  {name || "Your Name"}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>
                  {user?.email}
                </p>
              </div>
            </div>

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
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--card-border)",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--aura-primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--card-border)")
                }
              />
            </div>
          </div>

          {/* Focus preferences */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionHeader
              title="Focus Preferences"
              subtitle="Default session settings"
            />

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                  marginBottom: "10px",
                }}
              >
                Default Focus Duration
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {FOCUS_DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFocusDuration(d)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-full)",
                      border:
                        focusDuration === d
                          ? "2px solid var(--aura-primary)"
                          : "1.5px solid var(--card-border)",
                      background:
                        focusDuration === d
                          ? "var(--aura-primary-light)"
                          : "transparent",
                      color:
                        focusDuration === d
                          ? "var(--aura-primary)"
                          : "var(--text-secondary)",
                      fontSize: "13px",
                      fontWeight: focusDuration === d ? "600" : "400",
                      cursor: "pointer",
                    }}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                  marginBottom: "10px",
                }}
              >
                Default Break Duration
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {BREAK_DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setBreakDuration(d)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-full)",
                      border:
                        breakDuration === d
                          ? "2px solid var(--aura-primary)"
                          : "1.5px solid var(--card-border)",
                      background:
                        breakDuration === d
                          ? "var(--aura-primary-light)"
                          : "transparent",
                      color:
                        breakDuration === d
                          ? "var(--aura-primary)"
                          : "var(--text-secondary)",
                      fontSize: "13px",
                      fontWeight: breakDuration === d ? "600" : "400",
                      cursor: "pointer",
                    }}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ambient sound */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionHeader
              title="Ambient Sound"
              subtitle="Default sound during focus sessions"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {AMBIENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAmbientSound(opt.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    border:
                      ambientSound === opt.id
                        ? "1.5px solid var(--aura-primary)"
                        : "1.5px solid transparent",
                    background:
                      ambientSound === opt.id
                        ? "var(--aura-primary-light)"
                        : "var(--surface-secondary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{opt.emoji}</span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: ambientSound === opt.id ? "600" : "400",
                      color:
                        ambientSound === opt.id
                          ? "var(--aura-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {opt.label}
                  </span>
                  {ambientSound === opt.id && (
                    <span
                      style={{
                        marginLeft: "auto",
                        color: "var(--aura-primary)",
                        fontSize: "16px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notification quiet hours */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionHeader
              title="Quiet Hours"
              subtitle="AURA won't send interventions during these hours"
            />
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  Start time
                </label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--card-border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  End time
                </label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--card-border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="aura-card" style={{ padding: "24px" }}>
            <SectionHeader
              title="Privacy & Account"
              subtitle="Manage your data and account"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Email
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-tertiary)",
                      margin: 0,
                    }}
                  >
                    {user?.email}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "3px 10px",
                    background: "var(--success-bg)",
                    color: "var(--success)",
                    borderRadius: "var(--radius-full)",
                    fontWeight: "500",
                  }}
                >
                  Verified
                </span>
              </div>

              <button
                onClick={signOut}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1.5px solid #dc2626",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "14px",
              background: saved
                ? "var(--success)"
                : saving
                ? "var(--text-tertiary)"
                : "var(--aura-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "15px",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            {saved
              ? "✅ Saved!"
              : saving
              ? "Saving..."
              : "Save Settings"}
          </button>

          <div style={{ height: "32px" }} />
        </div>
      </PageWrapper>
    </div>
  );
}