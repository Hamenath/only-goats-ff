"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, Users, Settings } from "lucide-react";

const BOTTOM_TABS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/tournaments", icon: Trophy, label: "Tournament" },
  { href: "/admin/teams", icon: Users, label: "Teams" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="admin-mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,
        background: "#0F172A",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        fontFamily: "Inter, sans-serif",
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
              color: active ? "#38BDF8" : "#64748B",
              transition: "all 0.15s ease",
            }}
          >
            <div
              style={{
                padding: "3px 12px",
                borderRadius: 12,
                background: active ? "rgba(56, 189, 248, 0.15)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} color={active ? "#38BDF8" : "#64748B"} />
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
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
