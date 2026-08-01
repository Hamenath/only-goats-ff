"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, UserCheck, Wallet, Swords,
  Trophy, Image, Megaphone, Settings, ShieldCheck,
  FileText, User, LogOut, ChevronLeft, ChevronRight,
  CheckCircle2, Zap, Shield
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminStore } from "@/store/useAdminStore";

interface NavGroup {
  title: string;
  items: { href: string; icon: any; label: string }[];
}

const MENU_GROUPS: NavGroup[] = [
  {
    title: "MAIN",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "ESPORTS",
    items: [
      { href: "/admin/tournaments", icon: Trophy, label: "Tournaments" },
      { href: "/admin/teams", icon: UserCheck, label: "Teams" },
      { href: "/admin/registrations", icon: Users, label: "Registrations" },
      { href: "/admin/players", icon: User, label: "Players" },
    ],
  },
  {
    title: "MATCHES & SCORING",
    items: [
      { href: "/admin/matches", icon: Swords, label: "Matches" },
      { href: "/admin/results", icon: CheckCircle2, label: "Results & Qualify" },
      { href: "/admin/premium-pass", icon: Zap, label: "Premium Pass" },
      { href: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { href: "/admin/payments", icon: Wallet, label: "Payments" },
      { href: "/admin/gallery", icon: Image, label: "Gallery" },
      { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
      { href: "/admin/admins", icon: ShieldCheck, label: "Admins" },
      { href: "/admin/logs", icon: FileText, label: "Logs" },
      { href: "/admin/profile", icon: User, label: "Profile" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, theme } = useAdminStore();

  const isDark = theme === "dark";
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const w = sidebarCollapsed ? 80 : 270;

  return (
    <aside
      className="admin-desktop-only"
      style={{
        width: w,
        minHeight: "calc(100vh - 72px)",
        background: isDark ? "#0F172A" : "#FFFFFF",
        borderRight: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "sticky",
        top: 72,
        height: "calc(100vh - 72px)",
        zIndex: 30,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Scrollable Nav List */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto", overflowX: "hidden" }}>
        {MENU_GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: 16 }}>
            {!sidebarCollapsed && (
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 800,
                  color: isDark ? "#64748B" : "#94A3B8",
                  letterSpacing: "0.08em",
                  padding: "0 14px 6px",
                  textTransform: "uppercase",
                }}
              >
                {group.title}
              </span>
            )}
            {group.items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");

              return (
                <Link key={href} href={href} title={sidebarCollapsed ? label : undefined} style={{ textDecoration: "none", display: "block", marginBottom: 3 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: sidebarCollapsed ? "11px 0" : "11px 14px",
                      borderRadius: 14,
                      cursor: "pointer",
                      justifyContent: sidebarCollapsed ? "center" : "flex-start",
                      background: active
                        ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                        : "transparent",
                      color: active ? "#FFFFFF" : isDark ? "#94A3B8" : "#475569",
                      boxShadow: active ? "0 4px 16px rgba(37, 99, 235, 0.4)" : "none",
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0, color: active ? "#FFFFFF" : "#2563EB" }} />
                    {!sidebarCollapsed && <span>{label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer & Logout */}
      <div style={{ padding: "12px 12px 18px", borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0", position: "relative" }}>
        <button
          onClick={handleLogout}
          title={sidebarCollapsed ? "Logout" : undefined}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: sidebarCollapsed ? "11px 0" : "11px 14px",
            borderRadius: 14,
            cursor: "pointer",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            color: "#EF4444",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          style={{
            position: "absolute",
            right: sidebarCollapsed ? "50%" : -12,
            transform: sidebarCollapsed ? "translateX(50%)" : "none",
            top: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: isDark ? "#1E293B" : "#FFFFFF",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #CBD5E1",
            color: isDark ? "#94A3B8" : "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 40,
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
