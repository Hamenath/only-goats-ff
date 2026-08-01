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

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/tournaments", icon: Trophy, label: "Tournaments" },
  { href: "/admin/registrations", icon: Users, label: "Registrations" },
  { href: "/admin/teams", icon: UserCheck, label: "Teams" },
  { href: "/admin/players", icon: User, label: "Players" },
  { href: "/admin/payments", icon: Wallet, label: "Payments" },
  { href: "/admin/matches", icon: Swords, label: "Matches" },
  { href: "/admin/results", icon: CheckCircle2, label: "Results & Qualify" },
  { href: "/admin/premium-pass", icon: Zap, label: "Premium Pass" },
  { href: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/admin/gallery", icon: Image, label: "Gallery" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
  { href: "/admin/admins", icon: ShieldCheck, label: "Admins" },
  { href: "/admin/logs", icon: FileText, label: "Logs" },
];

const BOTTOM_ITEMS = [
  { href: "/admin/profile", icon: User, label: "Profile" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useAdminStore();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const w = sidebarCollapsed ? 72 : 250;

  return (
    <aside
      className="admin-desktop-only"
      style={{
        width: w,
        minHeight: "100vh",
        background: "#0F172A",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 30,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: sidebarCollapsed ? "18px 12px" : "18px 16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: sidebarCollapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #2563EB, #38BDF8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 14px rgba(37, 99, 235, 0.4)",
            flexShrink: 0,
          }}
        >
          <Shield size={20} color="#FFFFFF" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 900,
                fontSize: 16,
                color: "#F8FAFC",
                letterSpacing: "-0.02em",
                display: "block",
                lineHeight: 1,
              }}
            >
              ONLY GOAT'S
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#38BDF8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              ESPORTS ADMIN
            </span>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto", overflowX: "hidden" }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: 3 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: sidebarCollapsed ? "10px 0" : "11px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  background: active ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "transparent",
                  color: active ? "#FFFFFF" : "#94A3B8",
                  boxShadow: active ? "0 4px 16px rgba(37, 99, 235, 0.35)" : "none",
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={18} style={{ flexShrink: 0, color: active ? "#FFFFFF" : "#38BDF8" }} />
                {!sidebarCollapsed && <span>{label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div style={{ padding: "10px 10px 14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: 3 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: sidebarCollapsed ? "10px 0" : "11px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  background: active ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "transparent",
                  color: active ? "#FFFFFF" : "#94A3B8",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Icon size={18} style={{ flexShrink: 0, color: "#38BDF8" }} />
                {!sidebarCollapsed && <span>{label}</span>}
              </div>
            </Link>
          );
        })}
        <div
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: sidebarCollapsed ? "10px 0" : "11px 14px",
            borderRadius: 12,
            cursor: "pointer",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            color: "#EF4444",
            background: "rgba(239, 68, 68, 0.08)",
            fontSize: 13,
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && <span>Logout</span>}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          right: 12,
          bottom: 72,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#1E293B",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#94A3B8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
