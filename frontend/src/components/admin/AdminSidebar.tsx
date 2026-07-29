"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, UserCheck, Wallet, Swords,
  Trophy, Image, Megaphone, Settings, ShieldCheck,
  FileText, User, LogOut, ChevronLeft, ChevronRight,
  Menu
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminStore } from "../../store/useAdminStore";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/registrations", icon: Users, label: "Registrations" },
  { href: "/admin/teams", icon: UserCheck, label: "Teams" },
  { href: "/admin/players", icon: User, label: "Players" },
  { href: "/admin/payments", icon: Wallet, label: "Payments" },
  { href: "/admin/matches", icon: Swords, label: "Matches" },
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

  const w = sidebarCollapsed ? 64 : 240;

  return (
    <>
      <aside style={{
        width: w, minHeight: "100vh", background: "#FFFFFF",
        borderRight: "1px solid #E2E8F0", display: "flex",
        flexDirection: "column", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
        overflow: "hidden",
      }}>
        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: 2 }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 10, padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                  borderRadius: 10, cursor: "pointer",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  background: active ? "#FEF2F2" : "transparent",
                  color: active ? "#EF4444" : "#64748B",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC";
                      (e.currentTarget as HTMLDivElement).style.color = "#0F172A";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      (e.currentTarget as HTMLDivElement).style.color = "#64748B";
                    }
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && (
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: "Inter, sans-serif" }}>
                      {label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "8px 8px 12px", borderTop: "1px solid #E2E8F0" }}>
          {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: 2 }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 10, padding: sidebarCollapsed ? "10px 0" : "10px 12px",
                  borderRadius: 10, cursor: "pointer",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  background: active ? "#FEF2F2" : "transparent",
                  color: active ? "#EF4444" : "#64748B",
                  transition: "all 0.15s ease",
                }}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && (
                    <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "Inter, sans-serif" }}>{label}</span>
                  )}
                </div>
              </Link>
            );
          })}
          <div
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center",
              gap: 10, padding: sidebarCollapsed ? "10px 0" : "10px 12px",
              borderRadius: 10, cursor: "pointer",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              color: "#64748B", transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.color = "#DC2626";
              (e.currentTarget as HTMLDivElement).style.background = "#FEF2F2";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.color = "#64748B";
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && (
              <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "Inter, sans-serif" }}>Logout</span>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          style={{
            position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)",
            width: 24, height: 24, borderRadius: "50%",
            background: "#FFFFFF", border: "1px solid #E2E8F0",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 50,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {sidebarCollapsed
            ? <ChevronRight size={12} color="#64748B" />
            : <ChevronLeft size={12} color="#64748B" />
          }
        </button>
      </aside>

      {/* Spacer */}
      <div style={{ width: w, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />
    </>
  );
}
