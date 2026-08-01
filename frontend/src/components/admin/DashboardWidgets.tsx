"use client";

import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
        flexWrap: "wrap",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: "#9CA3AF", margin: "3px 0 0", fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface ChartCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function ChartCard({ children, style }: ChartCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid #E5E7EB",
        padding: "20px 20px 16px",
        boxShadow: "0 1px 4px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.02)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface EmptyChartStateProps {
  title: string;
  message: string;
}

export function EmptyChartState({ title, message }: EmptyChartStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 180,
        color: "#9CA3AF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          marginBottom: 4,
        }}
      >
        📊
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", margin: 0 }}>{title}</p>
      <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, textAlign: "center", maxWidth: 200 }}>
        {message}
      </p>
    </div>
  );
}
