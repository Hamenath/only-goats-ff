"use client";

import { LucideIcon } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconGradient?: string;
  trend?: { value: number; label: string };
  accent?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconGradient = "linear-gradient(135deg, #2563EB, #38BDF8)",
  trend,
  accent,
}: StatsCardProps) {
  const { theme } = useAdminStore();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        height: 140,
        background: accent
          ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
          : isDark
          ? "#111827"
          : "#FFFFFF",
        border: accent
          ? "1px solid #3B82F6"
          : isDark
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid #E2E8F0",
        borderRadius: 24,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: accent
          ? "0 14px 35px rgba(37, 99, 235, 0.35)"
          : isDark
          ? "0 10px 30px rgba(0, 0, 0, 0.25)"
          : "0 10px 30px rgba(0, 0, 0, 0.04)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        width: "100%",
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = accent
          ? "0 20px 45px rgba(37, 99, 235, 0.45)"
          : isDark
          ? "0 18px 40px rgba(0, 0, 0, 0.4)"
          : "0 18px 40px rgba(37, 99, 235, 0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = accent
          ? "0 14px 35px rgba(37, 99, 235, 0.35)"
          : isDark
          ? "0 10px 30px rgba(0, 0, 0, 0.25)"
          : "0 10px 30px rgba(0, 0, 0, 0.04)";
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: accent ? "rgba(255, 255, 255, 0.9)" : isDark ? "#94A3B8" : "#64748B",
            marginBottom: 6,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: accent ? "#FFFFFF" : isDark ? "#F8FAFC" : "#0F172A",
            lineHeight: 1,
            fontFamily: "Space Grotesk, Inter, sans-serif",
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </p>
        {subtitle && (
          <p
            style={{
              fontSize: 12,
              color: accent ? "rgba(255, 255, 255, 0.75)" : isDark ? "#64748B" : "#94A3B8",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Gradient Circle Icon */}
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: accent ? "rgba(255, 255, 255, 0.2)" : iconGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: accent ? "none" : "0 6px 18px rgba(37, 99, 235, 0.3)",
        }}
      >
        <Icon size={24} color="#FFFFFF" />
      </div>
    </div>
  );
}
