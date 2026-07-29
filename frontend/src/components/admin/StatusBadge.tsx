"use client";

type Status = "pending" | "approved" | "rejected" | "live" | "upcoming" | "completed" | "active" | "inactive" | string;

const STATUS_MAP: Record<string, { bg: string; color: string; dot: string }> = {
  pending:   { bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04" },
  approved:  { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  rejected:  { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
  live:      { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
  upcoming:  { bg: "#E0F2FE", color: "#0369A1", dot: "#0EA5E9" },
  completed: { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" },
  active:    { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  inactive:  { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" },
};

interface StatusBadgeProps {
  status: Status;
  pulse?: boolean;
}

export function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status.toLowerCase()] ?? { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif",
      letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0,
        ...(pulse ? { animation: "statusPulse 1.5s ease-in-out infinite" } : {}),
      }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
      <style>{`@keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </span>
  );
}
