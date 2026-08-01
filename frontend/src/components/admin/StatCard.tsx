"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label?: string };
  accent?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "#2563EB",
  iconBg = "rgba(37, 99, 235, 0.08)",
  trend,
  accent = false,
}: StatCardProps) {
  return (
    <div
      style={{
        background: accent ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" : "#FFFFFF",
        border: accent ? "none" : "1px solid #E5E7EB",
        borderRadius: 20,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: accent
          ? "0 4px 20px rgba(37, 99, 235, 0.25)"
          : "0 1px 4px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.02)",
        transition: "transform 250ms ease, box-shadow 250ms ease",
        cursor: "default",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = accent
          ? "0 8px 28px rgba(37, 99, 235, 0.35)"
          : "0 8px 24px rgba(15,23,42,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = accent
          ? "0 4px 20px rgba(37, 99, 235, 0.25)"
          : "0 1px 4px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.02)";
      }}
    >
      {/* Top: Icon + Title + Trend */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: accent ? "rgba(255,255,255,0.18)" : iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={17} color={accent ? "#FFFFFF" : iconColor} strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: accent ? "rgba(255,255,255,0.8)" : "#6B7280",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </span>
        </div>

        {trend && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "3px 7px",
              borderRadius: 8,
              background: accent
                ? "rgba(255,255,255,0.18)"
                : trend.value >= 0
                ? "#DCFCE7"
                : "#FEE2E2",
              color: accent ? "#FFFFFF" : trend.value >= 0 ? "#15803D" : "#B91C1C",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {trend.value >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>

      {/* Middle: Large Number */}
      <div>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: accent ? "#FFFFFF" : "#111827",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            display: "block",
          }}
        >
          {value}
        </span>
      </div>

      {/* Bottom: Description */}
      {description && (
        <p
          style={{
            fontSize: 12,
            color: accent ? "rgba(255,255,255,0.65)" : "#9CA3AF",
            margin: 0,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
