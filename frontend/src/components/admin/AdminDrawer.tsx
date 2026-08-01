"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Trophy, Users, UserCheck, User, Wallet, Swords,
  CheckCircle2, Zap, Image, Megaphone, Settings, ShieldCheck,
  FileText, LogOut, X, Shield
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminStore } from "@/store/useAdminStore";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/tournaments", icon: Trophy, label: "Tournaments" },
  { href: "/admin/teams", icon: UserCheck, label: "Teams" },
  { href: "/admin/registrations", icon: Users, label: "Registrations" },
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

export function AdminDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useAdminStore();

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
          background: "rgba(2, 6, 23, 0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "fadeIn 0.25s ease-out",
        }}
      />

      {/* Drawer Panel (Width 80vw, max 300px) */}
      <aside
        style={{
          position: "relative",
          zIndex: 10000,
          width: "80vw",
          maxWidth: 300,
          height: "100vh",
          background: "#0F172A",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "10px 0 40px rgba(0,0,0,0.5)",
          animation: "slideDrawerIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header inside drawer */}
        <div
          style={{
            padding: "20px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #2563EB, #38BDF8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(37, 99, 235, 0.4)",
              }}
            >
              <Shield size={18} color="#FFFFFF" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 900,
                  fontSize: 15,
                  color: "#F8FAFC",
                  letterSpacing: "-0.02em",
                  display: "block",
                }}
              >
                ONLY GOAT'S
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#38BDF8",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Admin Control
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close Drawer"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#94A3B8",
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
            gap: 4,
          }}
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
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
                    padding: "12px 14px",
                    borderRadius: 14,
                    cursor: "pointer",
                    background: active
                      ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                      : "transparent",
                    color: active ? "#FFFFFF" : "#94A3B8",
                    boxShadow: active
                      ? "0 4px 16px rgba(37, 99, 235, 0.4)"
                      : "none",
                    fontWeight: active ? 700 : 500,
                    fontSize: 14,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      color: active ? "#FFFFFF" : "#38BDF8",
                      flexShrink: 0,
                    }}
                  />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer inside drawer */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <Link
            href="/admin/profile"
            onClick={() => setMobileDrawerOpen(false)}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                color: "#94A3B8",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <User size={18} style={{ color: "#38BDF8" }} />
              <span>Admin Profile</span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              padding: "12px 14px",
              borderRadius: 14,
              color: "#EF4444",
              fontSize: 14,
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
