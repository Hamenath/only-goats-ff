"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  footer?: string;
  accent?: boolean;
}

export function StatsWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "#2563EB",
  iconBg = "rgba(37, 99, 235, 0.08)",
  trend,
  footer,
  accent = false,
}: StatsWidgetProps) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 150,
        background: accent ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" : "#FFFFFF",
        border: accent ? "none" : "1px solid #E2E8F0",
        borderRadius: 24,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: accent
          ? "0 8px 24px rgba(37, 99, 235, 0.3)"
          : "0 2px 6px rgba(15, 23, 42, 0.04), 0 10px 20px rgba(15, 23, 42, 0.02)",
        transition: "transform 250ms ease, box-shadow 250ms ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = accent
          ? "0 14px 32px rgba(37, 99, 235, 0.4)"
          : "0 12px 30px rgba(15, 23, 42, 0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = accent
          ? "0 8px 24px rgba(37, 99, 235, 0.3)"
          : "0 2px 6px rgba(15, 23, 42, 0.04), 0 10px 20px rgba(15, 23, 42, 0.02)";
      }}
    >
      {/* Top Row: Icon + Label + Trend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: accent ? "rgba(255, 255, 255, 0.2)" : iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={accent ? "#FFFFFF" : iconColor} strokeWidth={2} />
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: accent ? "rgba(255, 255, 255, 0.85)" : "#64748B",
                margin: 0,
              }}
            >
              {title}
            </p>
          </div>
        </div>

        {trend && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 10,
              background: accent
                ? "rgba(255, 255, 255, 0.2)"
                : trend.value >= 0
                ? "#DCFCE7"
                : "#FEE2E2",
              color: accent ? "#FFFFFF" : trend.value >= 0 ? "#16A34A" : "#DC2626",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {trend.value >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}
      </div>

      {/* Middle Row: Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: accent ? "#FFFFFF" : "#0F172A",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {subtitle && (
          <span style={{ fontSize: 13, fontWeight: 500, color: accent ? "rgba(255,255,255,0.75)" : "#94A3B8" }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Footer Row */}
      <div style={{ borderTop: accent ? "1px solid rgba(255,255,255,0.15)" : "1px solid #F1F5F9", paddingTop: 8 }}>
        <p style={{ fontSize: 12, color: accent ? "rgba(255, 255, 255, 0.7)" : "#94A3B8", margin: 0, fontWeight: 500 }}>
          {footer || "Last updated 2 min ago"}
        </p>
      </div>
    </div>
  );
}
