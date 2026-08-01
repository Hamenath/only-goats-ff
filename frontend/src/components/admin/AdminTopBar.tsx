"use client";

import Link from "next/link";
import { Menu, Bell, Shield, User, LogOut, Search } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminTopBar() {
  const { toggleMobileDrawer } = useAdminStore();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
        height: 64,
        background: "#0F172A",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* LEFT: Mobile Hamburger Button & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={toggleMobileDrawer}
          className="admin-mobile-only"
          aria-label="Open Navigation Drawer"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Menu size={20} />
        </button>

        <Link
          href="/admin/dashboard"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
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
              ADMIN PANEL
            </span>
          </div>
        </Link>
      </div>

      {/* CENTER: Desktop Search Bar (Hidden on Mobile) */}
      <div
        className="admin-desktop-only"
        style={{
          position: "relative",
          maxWidth: 360,
          width: "100%",
          margin: "0 24px",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748B",
          }}
        />
        <input
          type="text"
          placeholder="Search teams, registrations, matches..."
          style={{
            width: "100%",
            padding: "9px 14px 9px 40px",
            borderRadius: 10,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F8FAFC",
            fontSize: 13,
            outline: "none",
            transition: "all 0.2s ease",
          }}
        />
      </div>

      {/* RIGHT: Notifications & Profile Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        {/* Notification Bell */}
        <button
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#94A3B8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#EF4444",
              boxShadow: "0 0 8px #EF4444",
            }}
          />
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={() => setShowProfileMenu((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "4px 10px 4px 4px",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            A
          </div>
          <span
            className="admin-desktop-only"
            style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}
          >
            Admin
          </span>
        </button>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 48,
              width: 180,
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 14,
              padding: "6px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              zIndex: 100,
            }}
          >
            <Link
              href="/admin/profile"
              onClick={() => setShowProfileMenu(false)}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                color: "#F8FAFC",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <User size={15} color="#38BDF8" /> Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                color: "#EF4444",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
