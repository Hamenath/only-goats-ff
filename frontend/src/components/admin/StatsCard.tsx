"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  accent?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "#38BDF8",
  iconBg = "rgba(56, 189, 248, 0.12)",
  trend,
  accent,
}: StatsCardProps) {
  return (
    <div
      style={{
        background: accent
          ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
          : "#111827",
        border: accent
          ? "1px solid #3B82F6"
          : "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 20,
        padding: "20px 22px",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        boxShadow: accent
          ? "0 10px 30px rgba(37, 99, 235, 0.35)"
          : "0 10px 25px rgba(0, 0, 0, 0.2)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        width: "100%",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = accent
          ? "#60A5FA"
          : "rgba(56, 189, 248, 0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = accent
          ? "#3B82F6"
          : "rgba(255, 255, 255, 0.08)";
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: accent ? "rgba(255, 255, 255, 0.2)" : iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={accent ? "#FFFFFF" : iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: accent ? "rgba(255, 255, 255, 0.85)" : "#94A3B8",
            marginBottom: 6,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#F8FAFC",
            lineHeight: 1,
            fontFamily: "Space Grotesk, Inter, sans-serif",
          }}
        >
          {value}
        </p>
        {subtitle && (
          <p
            style={{
              fontSize: 12,
              color: accent ? "rgba(255, 255, 255, 0.7)" : "#64748B",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </p>
        )}
        {trend && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
                background: trend.value >= 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: trend.value >= 0 ? "#4ADE80" : "#F87171",
              }}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span
              style={{
                fontSize: 11,
                color: accent ? "rgba(255, 255, 255, 0.7)" : "#64748B",
              }}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
