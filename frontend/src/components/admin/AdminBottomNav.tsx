"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, Users, Settings } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

const BOTTOM_TABS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/tournaments", icon: Trophy, label: "Tournament" },
  { href: "/admin/teams", icon: Users, label: "Teams" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const { theme } = useAdminStore();
  const isDark = theme === "dark";

  return (
    <nav
      className="admin-mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: isDark ? "#0F172A" : "#FFFFFF",
        borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        fontFamily: "Inter, sans-serif",
        boxShadow: isDark ? "0 -4px 20px rgba(0, 0, 0, 0.3)" : "0 -4px 20px rgba(0, 0, 0, 0.04)",
      }}
    >
      {BOTTOM_TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            style={{
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              flex: 1,
              height: "100%",
              color: active ? "#2563EB" : isDark ? "#64748B" : "#94A3B8",
              transition: "all 0.15s ease",
            }}
          >
            <div
              style={{
                padding: "4px 14px",
                borderRadius: 12,
                background: active
                  ? isDark
                    ? "rgba(37, 99, 235, 0.2)"
                    : "#EFF6FF"
                  : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} color={active ? "#2563EB" : isDark ? "#64748B" : "#94A3B8"} />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 800 : 500,
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
