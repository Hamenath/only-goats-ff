"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Bell, Search, Moon, Sun, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

export function AdminNavbar() {
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

  // Global search shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("admin-global-search")?.focus();
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
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <header style={{
      height: 64, background: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
      display: "flex", alignItems: "center", padding: "0 24px",
      gap: 16, position: "sticky", top: 0, zIndex: 30,
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <Search size={15} style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "#94A3B8",
        }} />
        <input
          id="admin-global-search"
          type="text"
          placeholder="Search... (Ctrl+K)"
          style={{
            width: "100%", padding: "8px 12px 8px 36px",
            background: "#F8FAFC", border: "1px solid #E2E8F0",
            borderRadius: 10, fontSize: 13, color: "#0F172A",
            outline: "none", fontFamily: "Inter, sans-serif",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.background = "#fff"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
        />
        <kbd style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 5,
          padding: "2px 6px", fontSize: 10, color: "#94A3B8", fontFamily: "monospace",
        }}>⌘K</kbd>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {/* Dark mode */}
        <button
          onClick={() => setDark(!dark)}
          style={{
            width: 36, height: 36, borderRadius: 10, border: "1px solid #E2E8F0",
            background: "#F8FAFC", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
          }}
        >
          {dark ? <Sun size={16} color="#64748B" /> : <Moon size={16} color="#64748B" />}
        </button>

        {/* Notifications */}
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: "1px solid #E2E8F0",
          background: "#F8FAFC", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", position: "relative",
        }}>
          <Bell size={16} color="#64748B" />
          <span style={{
            position: "absolute", top: 7, right: 7, width: 7, height: 7,
            borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff",
          }} />
        </button>

        {/* Profile dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px", borderRadius: 10, border: "1px solid #E2E8F0",
              background: "#F8FAFC", cursor: "pointer",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: "#EF4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>
              {initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }}>
                {user?.displayName || "Admin"}
              </p>
              <p style={{ fontSize: 10, color: "#64748B", lineHeight: 1 }}>
                {user?.email?.slice(0, 20) || ""}
              </p>
            </div>
            <ChevronDown size={14} color="#64748B" style={{ transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)", width: 180, overflow: "hidden",
              zIndex: 100,
            }}>
              {[
                { icon: User, label: "Profile", href: "/admin/profile" },
                { icon: Settings, label: "Settings", href: "/admin/settings" },
              ].map(({ icon: Icon, label, href }) => (
                <button
                  key={href}
                  onClick={() => { router.push(href); setProfileOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", background: "transparent", border: "none",
                    cursor: "pointer", fontSize: 13, color: "#0F172A",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Icon size={14} color="#64748B" />
                  {label}
                </button>
              ))}
              <div style={{ height: 1, background: "#E2E8F0", margin: "4px 0" }} />
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", background: "transparent", border: "none",
                  cursor: "pointer", fontSize: 13, color: "#DC2626",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FEF2F2")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={14} color="#DC2626" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
