"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

interface QuickActionButtonProps {
  label: string;
  description?: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  badge?: string;
}

export function QuickActionButton({
  label,
  description,
  icon: Icon,
  href,
  color = "#2563EB",
  badge,
}: QuickActionButtonProps) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
          transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
          cursor: "pointer",
          position: "relative",
          fontFamily: "Inter, sans-serif",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-3px)";
          el.style.borderColor = color;
          el.style.boxShadow = `0 8px 24px rgba(15,23,42,0.08)`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.borderColor = "#E5E7EB";
          el.style.boxShadow = "0 1px 4px rgba(15,23,42,0.04)";
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: color + "14",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={color} strokeWidth={2} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {label}
            </span>
            {badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 20,
                  background: color + "14",
                  color: color,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                margin: "2px 0 0",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight size={15} color="#D1D5DB" style={{ flexShrink: 0 }} />
      </div>
    </Link>
  );
}
