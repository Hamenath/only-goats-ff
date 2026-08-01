"use client";

import Link from "next/link";
import { Menu, Bell, Shield, User, LogOut, Search, Sun, Moon } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminTopBar() {
  const { toggleMobileDrawer, theme, toggleTheme } = useAdminStore();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isDark = theme === "dark";

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: 72,
        background: isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
        borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        fontFamily: "Inter, sans-serif",
        boxShadow: isDark ? "0 4px 20px rgba(0, 0, 0, 0.3)" : "0 4px 20px rgba(0, 0, 0, 0.03)",
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* LEFT: Mobile Hamburger & Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={toggleMobileDrawer}
          className="admin-mobile-only"
          aria-label="Open Navigation Drawer"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #CBD5E1",
            color: isDark ? "#F8FAFC" : "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Menu size={22} />
        </button>

        <Link
          href="/admin/dashboard"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg, #2563EB, #38BDF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(37, 99, 235, 0.4)",
            }}
          >
            <Shield size={20} color="#FFFFFF" />
          </div>
          <div>
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 900,
                fontSize: 17,
                color: isDark ? "#F8FAFC" : "#0F172A",
                letterSpacing: "-0.02em",
                display: "block",
                lineHeight: 1.1,
              }}
            >
              ONLY GOAT'S
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#2563EB",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              ADMIN DASHBOARD
            </span>
          </div>
        </Link>
      </div>

      {/* CENTER: Rounded Search Bar (Desktop) */}
      <div
        className="admin-desktop-only"
        style={{
          position: "relative",
          maxWidth: 420,
          width: "100%",
          margin: "0 32px",
        }}
      >
        <Search
          size={18}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: isDark ? "#64748B" : "#94A3B8",
          }}
        />
        <input
          type="text"
          placeholder="Search registrations, squad names, transactions..."
          style={{
            width: "100%",
            padding: "11px 16px 11px 44px",
            borderRadius: 100,
            background: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontSize: 13,
            outline: "none",
            transition: "all 0.2s ease",
            fontWeight: 500,
          }}
        />
      </div>

      {/* RIGHT: Theme Switcher, Notifications & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        {/* Theme Switcher Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? "Light" : "Dark"} Theme`}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #CBD5E1",
            color: isDark ? "#FBBF24" : "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        <button
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #CBD5E1",
            color: isDark ? "#94A3B8" : "#64748B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Bell size={20} />
          <span
            style={{
              position: "absolute",
              top: 9,
              right: 9,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#EF4444",
              boxShadow: "0 0 8px #EF4444",
            }}
          />
        </button>

        {/* Profile Avatar & Dropdown Trigger */}
        <button
          onClick={() => setShowProfileMenu((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #CBD5E1",
            padding: "5px 12px 5px 5px",
            borderRadius: 14,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            A
          </div>
          <span
            className="admin-desktop-only"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isDark ? "#F8FAFC" : "#0F172A",
            }}
          >
            Admin User
          </span>
        </button>

        {/* Dropdown Menu */}
        {showProfileMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 54,
              width: 200,
              background: isDark ? "#111827" : "#FFFFFF",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "8px",
              boxShadow: "0 14px 40px rgba(0, 0, 0, 0.25)",
              zIndex: 100,
            }}
          >
            <div style={{ padding: "8px 12px 10px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #F1F5F9", marginBottom: 6 }}>
              <strong style={{ fontSize: 13, color: isDark ? "#F8FAFC" : "#0F172A", display: "block" }}>Only Goat's Admin</strong>
              <span style={{ fontSize: 11, color: isDark ? "#94A3B8" : "#64748B" }}>admin@onlygoats.online</span>
            </div>

            <Link
              href="/admin/profile"
              onClick={() => setShowProfileMenu(false)}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                color: isDark ? "#F8FAFC" : "#334155",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <User size={16} color="#2563EB" /> Profile & Account
            </Link>

            <button
              onClick={toggleTheme}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                color: isDark ? "#F8FAFC" : "#334155",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isDark ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color="#2563EB" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                background: "rgba(239, 68, 68, 0.1)",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                color: "#EF4444",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 6,
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
