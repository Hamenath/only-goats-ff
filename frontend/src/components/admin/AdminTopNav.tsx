"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Search, Bell, Moon, Sun, Plus, ChevronDown, User, Settings, LogOut, ShieldCheck } from "lucide-react";

export function AdminTopNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string | null; displayName: string | null } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser({ email: u.email, displayName: u.displayName });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("admin-topnav-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <header
      style={{
        height: 76,
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 35,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Centered Large Search Bar */}
      <div style={{ flex: 1, maxWidth: 440, position: "relative" }}>
        <Search
          size={18}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748B",
          }}
        />
        <input
          id="admin-topnav-search"
          type="text"
          placeholder="Search tournaments, teams, players... (Ctrl+K)"
          style={{
            width: "100%",
            height: 46,
            padding: "0 48px 0 46px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 500,
            color: "#0F172A",
            outline: "none",
            transition: "all 0.2s ease",
            fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#2563EB";
            e.currentTarget.style.background = "#FFFFFF";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.12)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0";
            e.currentTarget.style.background = "#F8FAFC";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <kbd
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            padding: "3px 7px",
            fontSize: 11,
            fontWeight: 600,
            color: "#64748B",
            fontFamily: "monospace",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Quick Create Button */}
        <button
          onClick={() => router.push("/admin/matches")}
          style={{
            height: 44,
            padding: "0 18px",
            borderRadius: 16,
            background: "#2563EB",
            color: "#FFFFFF",
            border: "none",
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
            transition: "all 0.2s ease",
            fontFamily: "Inter, sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.background = "#1D4ED8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Match
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDark(!dark)}
          aria-label="Toggle Theme"
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F8FAFC")}
        >
          {dark ? <Sun size={18} color="#64748B" /> : <Moon size={18} color="#64748B" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => router.push("/admin/announcements")}
          aria-label="Notifications"
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F8FAFC")}
        >
          <Bell size={18} color="#64748B" />
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#EF4444",
              border: "2px solid #FFFFFF",
            }}
          />
        </button>

        {/* Profile Avatar Dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 12px 6px 8px",
              borderRadius: 16,
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F8FAFC")}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
              }}
            >
              {initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                {user?.displayName || "Admin User"}
              </p>
              <p style={{ fontSize: 11, color: "#64748B", lineHeight: 1 }}>
                Esports Director
              </p>
            </div>
            <ChevronDown
              size={14}
              color="#64748B"
              style={{
                transition: "transform 0.2s ease",
                transform: profileOpen ? "rotate(180deg)" : "none",
              }}
            />
          </button>

          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 10px)",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 18,
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
                width: 200,
                padding: "6px",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              {[
                { icon: User, label: "Profile", href: "/admin/profile" },
                { icon: Settings, label: "Settings", href: "/admin/settings" },
                { icon: ShieldCheck, label: "Admins", href: "/admin/admins" },
              ].map(({ icon: Icon, label, href }) => (
                <button
                  key={href}
                  onClick={() => {
                    router.push(href);
                    setProfileOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#0F172A",
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.color = "#2563EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#0F172A";
                  }}
                >
                  <Icon size={16} color="#64748B" />
                  {label}
                </button>
              ))}
              <div style={{ height: 1, background: "#E2E8F0", margin: "6px 0" }} />
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#EF4444",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={16} color="#EF4444" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
