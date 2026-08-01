"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface AdminPageHeaderProps {
  category?: string;
  title: string;
  description?: string;
  badgeLabel?: string;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  category = "Admin",
  title,
  description,
  badgeLabel = "ESPORTS CONTROL CENTER",
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header-container" style={{ marginBottom: 32, fontFamily: "Inter, sans-serif" }}>
      {/* Breadcrumb & Small Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748B", fontWeight: 500 }}>
          <Link href="/admin/dashboard" style={{ color: "#64748B", textDecoration: "none" }}>
            {category}
          </Link>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ color: "#2563EB", fontWeight: 600 }}>{title}</span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: "rgba(37, 99, 235, 0.08)",
            color: "#2563EB",
            padding: "3px 10px",
            borderRadius: 20,
            border: "1px solid rgba(37, 99, 235, 0.2)",
          }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Main Title & Action Row */}
      <div
        className="admin-page-header-row"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1
            style={{
              fontSize: "clamp(24px, 5vw, 40px)",
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: "clamp(13px, 3.5vw, 16px)", color: "#64748B", marginTop: 8, maxWidth: 640, lineHeight: 1.5, margin: "8px 0 0" }}>
              {description}
            </p>
          )}
        </div>

        {actions && <div className="admin-page-header-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
      </div>
    </div>
  );
}
