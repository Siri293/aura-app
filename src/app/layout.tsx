import type { Metadata, Viewport } from "next";
import { Providers } from "@/lib/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AURA — Your AI Life Companion",
    template: "%s | AURA",
  },
  description:
    "An emotionally intelligent AI companion that understands, anticipates, and enables your daily life.",
  keywords: ["AI", "productivity", "mental wellness", "Gen Z", "companion"],
  authors: [{ name: "Team AURA" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AURA",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#5b8def",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ background: "var(--surface)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}