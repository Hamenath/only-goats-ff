"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Trophy, Users, UserCheck, User, Wallet, Swords,
  CheckCircle2, Zap, Image, Megaphone, Settings, ShieldCheck,
  FileText, LogOut, X, Shield, Sun, Moon
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminStore } from "@/store/useAdminStore";

const MENU_GROUPS = [
  {
    title: "MAIN",
    items: [{ href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
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

export function AdminDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileDrawerOpen, setMobileDrawerOpen, theme, toggleTheme } = useAdminStore();

  const isDark = theme === "dark";

  const handleLogout = async () => {
    setMobileDrawerOpen(false);
    await signOut(auth);
    router.push("/admin");
  };

  if (!mobileDrawerOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
      }}
    >
      {/* Backdrop overlay */}
      <div
        onClick={() => setMobileDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: isDark ? "rgba(2, 6, 23, 0.85)" : "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "fadeIn 0.25s ease-out",
        }}
      />

      {/* Drawer Panel (80vw width, max 320px) */}
      <aside
        style={{
          position: "relative",
          zIndex: 10000,
          width: "80vw",
          maxWidth: 320,
          height: "100vh",
          background: isDark ? "#0F172A" : "#FFFFFF",
          borderRight: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          boxShadow: "10px 0 40px rgba(0,0,0,0.5)",
          animation: "slideDrawerIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 18px",
            borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              }}
            >
              <Shield size={20} color="#FFFFFF" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 900,
                  fontSize: 16,
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  letterSpacing: "-0.02em",
                  display: "block",
                }}
              >
                ONLY GOAT'S
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#2563EB",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Mobile Navigation
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close Drawer"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #CBD5E1",
              color: isDark ? "#94A3B8" : "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {MENU_GROUPS.map((group) => (
            <div key={group.title}>
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 800,
                  color: isDark ? "#64748B" : "#94A3B8",
                  letterSpacing: "0.08em",
                  padding: "0 12px 6px",
                  textTransform: "uppercase",
                }}
              >
                {group.title}
              </span>
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 14px",
                        borderRadius: 14,
                        cursor: "pointer",
                        background: active
                          ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                          : "transparent",
                        color: active ? "#FFFFFF" : isDark ? "#94A3B8" : "#475569",
                        boxShadow: active
                          ? "0 4px 16px rgba(37, 99, 235, 0.4)"
                          : "none",
                        fontWeight: active ? 700 : 500,
                        fontSize: 14,
                        marginBottom: 2,
                      }}
                    >
                      <Icon size={18} style={{ color: active ? "#FFFFFF" : "#2563EB", flexShrink: 0 }} />
                      <span>{label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer inside drawer */}
        <div
          style={{
            padding: "14px 12px 20px",
            borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              width: "100%",
              background: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
              padding: "11px 14px",
              borderRadius: 14,
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            {isDark ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#2563EB" />}
            <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              padding: "11px 14px",
              borderRadius: 14,
              color: "#EF4444",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDrawerIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
