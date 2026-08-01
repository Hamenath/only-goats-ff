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
  title, value, subtitle, icon: Icon, iconColor = "#64748B",
  iconBg = "#F8FAFC", trend, accent,
}: StatsCardProps) {
  return (
    <div style={{
      background: accent ? "#EF4444" : "#FFFFFF",
      border: accent ? "none" : "1px solid #E2E8F0",
      borderRadius: 16, padding: "20px 24px",
      display: "flex", alignItems: "flex-start", gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
      transition: "box-shadow 0.2s, transform 0.2s",
      cursor: "default",
      fontFamily: "Inter, sans-serif",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: accent ? "rgba(255,255,255,0.2)" : iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={20} color={accent ? "#fff" : iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
          color: accent ? "rgba(255,255,255,0.75)" : "#64748B", marginBottom: 4,
        }}>
          {title}
        </p>
        <p style={{
          fontSize: 26, fontWeight: 700, color: accent ? "#fff" : "#0F172A", lineHeight: 1,
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.65)" : "#94A3B8", marginTop: 4 }}>
            {subtitle}
          </p>
        )}
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 6,
              background: trend.value >= 0 ? "#DCFCE7" : "#FEE2E2",
              color: trend.value >= 0 ? "#16A34A" : "#DC2626",
            }}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
            <span style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.6)" : "#94A3B8" }}>
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
