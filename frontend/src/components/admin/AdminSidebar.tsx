"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Users, UserCheck, Wallet, Swords,
  Trophy, Image as ImageIcon, Megaphone, Settings, ShieldCheck,
  FileText, User, LogOut, ChevronLeft, ChevronRight,
  Menu, CheckCircle2, Zap, Bell, X
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminStore } from "../../store/useAdminStore";

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
  { href: "/admin/gallery", icon: ImageIcon, label: "Gallery" },
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const w = sidebarCollapsed ? 64 : 240;

  return (
    <>
      {/* 1. MOBILE TOP APP BAR (< 768px) */}
      <header className="admin-mobile-topbar" style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 60, background: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", width: "100%", fontFamily: "Inter, sans-serif",
      }}>
        {/* Left: Hamburger Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open mobile menu"
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#0F172A",
          }}
        >
          <Menu size={22} />
        </button>

        {/* Center: Logo & Brand Title */}
        <Link href="/admin/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, overflow: "hidden",
            background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Image src="/logo.jpg" alt="Logo" width={28} height={28} style={{ objectFit: "cover" }} />
          </div>
          <span style={{
            fontFamily: "Space Grotesk, sans-serif", fontWeight: 800,
            fontSize: 16, color: "#111111", letterSpacing: "-0.02em"
          }}>
            ONLY GOAT&apos;S
          </span>
        </Link>

        {/* Right: Notifications & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => router.push("/admin/announcements")}
            aria-label="Notifications"
            style={{
              background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8,
              width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative"
            }}
          >
            <Bell size={16} color="#64748B" />
            <span style={{
              position: "absolute", top: 6, right: 6, width: 6, height: 6,
              borderRadius: "50%", background: "#EF4444"
            }} />
          </button>
          <button
            onClick={() => router.push("/admin/profile")}
            aria-label="Profile"
            style={{
              background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8,
              width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <User size={16} color="#64748B" />
          </button>
        </div>
      </header>

      {/* 2. MOBILE SLIDE-OUT DRAWER (< 768px) */}
      {/* Overlay Backdrop */}
      <div
        className="admin-mobile-drawer-overlay"
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          zIndex: 99, opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 0.3s ease-in-out",
        }}
      />

      {/* Slide Panel */}
      <aside
        className="admin-mobile-drawer"
        style={{
          position: "fixed", top: 0, bottom: 0, left: 0,
          width: "min(80vw, 320px)", background: "#FFFFFF",
          zIndex: 100, display: "flex", flexDirection: "column",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", background: "#DC2626" }}>
              <Image src="/logo.jpg" alt="Logo" width={32} height={32} style={{ objectFit: "cover" }} />
            </div>
            <div>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 16, color: "#111" }}>
                ONLY GOAT&apos;S
              </p>
              <p style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>ADMIN CONTROL</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            style={{
              background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8,
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#64748B"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Menu Items */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                style={{ textDecoration: "none", display: "block", marginBottom: 4 }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                  background: active ? "#FEF2F2" : "transparent",
                  color: active ? "#EF4444" : "#475569",
                  fontWeight: active ? 700 : 500, fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.15s ease",
                }}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Drawer Bottom Items */}
        <div style={{ padding: "12px", borderTop: "1px solid #E2E8F0" }}>
          {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                style={{ textDecoration: "none", display: "block", marginBottom: 4 }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                  background: active ? "#FEF2F2" : "transparent",
                  color: active ? "#EF4444" : "#475569",
                  fontWeight: 600, fontSize: 14, fontFamily: "Inter, sans-serif",
                }}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
          <div
            onClick={() => { setDrawerOpen(false); handleLogout(); }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 10, cursor: "pointer",
              color: "#DC2626", fontWeight: 600, fontSize: 14,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* 3. DESKTOP SIDEBAR (>= 768px) */}
      <aside className="admin-sidebar-desktop" style={{
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

      {/* Desktop Spacer */}
      <div className="admin-sidebar-spacer" style={{ width: w, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />
    </>
  );
}

