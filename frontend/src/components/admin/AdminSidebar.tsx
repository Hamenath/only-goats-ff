"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Trophy, Users, UserCheck, User, Wallet,
  Swords, CheckCircle2, Zap, Image as ImageIcon, Megaphone,
  Settings, ShieldCheck, FileText, LogOut, ChevronLeft, ChevronRight,
  Menu, X, Bell
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminStore } from "../../store/useAdminStore";

interface NavGroup {
  title: string;
  items: { href: string; icon: any; label: string; badge?: string }[];
}

const MENU_GROUPS: NavGroup[] = [
  {
    title: "MAIN",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/tournaments", icon: Trophy, label: "Tournament" },
      { href: "/admin/registrations", icon: Users, label: "Registrations" },
      { href: "/admin/teams", icon: UserCheck, label: "Teams" },
      { href: "/admin/players", icon: User, label: "Players" },
      { href: "/admin/payments", icon: Wallet, label: "Payments" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { href: "/admin/matches", icon: Swords, label: "Matches" },
      { href: "/admin/results", icon: CheckCircle2, label: "Results" },
      { href: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
      { href: "/admin/gallery", icon: ImageIcon, label: "Gallery" },
      { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
      { href: "/admin/premium-pass", icon: Zap, label: "Premium Pass" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
      { href: "/admin/admins", icon: ShieldCheck, label: "Admins" },
      { href: "/admin/logs", icon: FileText, label: "Logs" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/admin/profile", icon: User, label: "Profile" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useAdminStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Body Scroll Lock when Drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const w = sidebarCollapsed ? 88 : 280;

  return (
    <>
      {/* 1. MOBILE TOP BAR (< 768px) */}
      <header
        className="admin-mobile-topbar md:hidden"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 64,
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          width: "100%",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open mobile menu"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            cursor: "pointer",
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0F172A",
          }}
        >
          <Menu size={22} />
        </button>

        <Link href="/admin/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              overflow: "hidden",
              background: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/logo.jpg" alt="Logo" width={32} height={32} style={{ objectFit: "cover" }} />
          </div>
          <div>
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: "#0F172A",
                letterSpacing: "-0.02em",
                display: "block",
                lineHeight: 1,
              }}
            >
              ONLY GOAT&apos;S
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.04em" }}>
              ADMIN PANEL
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => router.push("/admin/announcements")}
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={18} color="#64748B" />
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#EF4444",
              }}
            />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      <div
        className="admin-mobile-drawer-overlay md:hidden"
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 99,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* MOBILE DRAWER PANEL */}
      <aside
        className="admin-mobile-drawer md:hidden"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          height: "100dvh",
          maxHeight: "100dvh",
          width: "min(80vw, 320px)",
          background: "#FFFFFF",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "8px 0 32px rgba(15, 23, 42, 0.15)",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "20px 20px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", background: "#2563EB" }}>
              <Image src="/logo.jpg" alt="Logo" width={36} height={36} style={{ objectFit: "cover" }} />
            </div>
            <div>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 16, color: "#0F172A", margin: 0 }}>
                ONLY GOAT&apos;S
              </p>
              <p style={{ fontSize: 11, color: "#2563EB", fontWeight: 700, margin: 0 }}>ADMIN PANEL</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Independent Scrollable Navigation Menu */}
        <nav style={{ flex: 1, padding: "16px 14px", overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
          {MENU_GROUPS.map((group) => (
            <div key={group.title} style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#94A3B8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0 12px",
                  marginBottom: 8,
                }}
              >
                {group.title}
              </p>
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    style={{ textDecoration: "none", display: "block", marginBottom: 4 }}
                  >
                    <div
                      style={{
                        height: 48,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "0 16px",
                        background: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
                        color: active ? "#2563EB" : "#475569",
                        fontWeight: active ? 700 : 500,
                        fontSize: 14,
                        position: "relative",
                      }}
                    >
                      {active && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 8,
                            bottom: 8,
                            width: 4,
                            background: "#2563EB",
                            borderRadius: "0 4px 4px 0",
                          }}
                        />
                      )}
                      <Icon size={18} color={active ? "#2563EB" : "#64748B"} />
                      <span>{label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Account Profile & Logout always reachable in scroll */}
          <div style={{ paddingTop: 12, borderTop: "1px solid #E2E8F0", marginTop: 12 }}>
            <div
              onClick={() => {
                setDrawerOpen(false);
                handleLogout();
              }}
              style={{
                height: 48,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
                color: "#EF4444",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <LogOut size={18} color="#EF4444" />
              <span>Logout</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* 2. DESKTOP SIDEBAR (>= 768px) */}
      <aside
        className="admin-sidebar-desktop hidden md:flex"
        style={{
          width: w,
          height: "100vh",
          background: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          transition: "width 250ms cubic-bezier(0.16, 1, 0.3, 1)",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
          boxShadow: "2px 0 12px rgba(15, 23, 42, 0.03)",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 76,
            padding: sidebarCollapsed ? "0" : "0 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              overflow: "hidden",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
              flexShrink: 0,
            }}
          >
            <Image src="/logo.jpg" alt="Logo" width={40} height={40} style={{ objectFit: "cover" }} />
          </div>

          {!sidebarCollapsed && (
            <div>
              <span
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 800,
                  fontSize: 17,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                  display: "block",
                  lineHeight: 1.1,
                }}
              >
                ONLY GOAT&apos;S
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2563EB",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Admin Panel
              </span>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <nav style={{ flex: 1, padding: "20px 14px", overflowY: "auto", overflowX: "hidden" }}>
          {MENU_GROUPS.map((group) => (
            <div key={group.title} style={{ marginBottom: 24 }}>
              {!sidebarCollapsed ? (
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#94A3B8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "0 14px",
                    marginBottom: 8,
                  }}
                >
                  {group.title}
                </p>
              ) : (
                <div style={{ height: 1, background: "#F1F5F9", margin: "12px 6px" }} />
              )}

              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: 4 }}>
                    <div
                      style={{
                        height: 48,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: sidebarCollapsed ? "0" : "0 14px",
                        justifyContent: sidebarCollapsed ? "center" : "flex-start",
                        background: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
                        color: active ? "#2563EB" : "#64748B",
                        fontWeight: active ? 700 : 500,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
                        position: "relative",
                        whiteSpace: "nowrap",
                        boxShadow: active ? "0 4px 14px rgba(37, 99, 235, 0.15)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "#F8FAFC";
                          e.currentTarget.style.color = "#0F172A";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#64748B";
                        }
                      }}
                    >
                      {active && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 10,
                            bottom: 10,
                            width: 4,
                            background: "#2563EB",
                            borderRadius: "0 4px 4px 0",
                          }}
                        />
                      )}
                      <Icon size={19} color={active ? "#2563EB" : "#64748B"} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && <span>{label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div style={{ padding: "12px 14px 20px", borderTop: "1px solid #E2E8F0" }}>
          <div
            onClick={handleLogout}
            style={{
              height: 48,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: sidebarCollapsed ? "0" : "0 14px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              color: "#EF4444",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEF2F2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={19} color="#EF4444" strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && <span>Logout</span>}
          </div>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          style={{
            position: "absolute",
            right: -14,
            top: "50%",
            transform: "translateY(-50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 50,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.1)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
        >
          {sidebarCollapsed ? <ChevronRight size={14} color="#64748B" /> : <ChevronLeft size={14} color="#64748B" />}
        </button>
      </aside>

      {/* Desktop Spacer */}
      <div
        className="admin-sidebar-spacer hidden md:block"
        style={{
          width: w,
          flexShrink: 0,
          transition: "width 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </>
  );
}
