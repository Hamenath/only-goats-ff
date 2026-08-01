"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";

interface QuickActionCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  badge?: string;
}

export function QuickActionCard({
  label,
  description,
  icon: Icon,
  href,
  color = "#2563EB",
  badge,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block w-full h-full" style={{ textDecoration: "none" }}>
      <div
        style={{
          height: "100%",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 24,
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
          transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
          cursor: "pointer",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-4px)";
          el.style.borderColor = color;
          el.style.boxShadow = "0 12px 28px rgba(15, 23, 42, 0.08)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.borderColor = "#E2E8F0";
          el.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.03)";
        }}
      >
        {/* Icon Block */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: color + "15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={color} strokeWidth={2} />
        </div>

        {/* Info Block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <h4
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0F172A",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {label}
            </h4>
            {badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 12,
                  background: color + "15",
                  color: color,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#64748B",
              margin: 0,
              lineHeight: 1.4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {description}
          </p>
        </div>

        {/* Chevron Arrow */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ChevronRight size={16} color="#64748B" />
        </div>
      </div>
    </Link>
  );
}
