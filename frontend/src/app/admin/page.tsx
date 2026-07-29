"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, Mail, Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back, Admin!");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Invalid credentials. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
        padding: "24px",
      }}
    >
      <div className="glass-card" style={{ padding: "56px 48px", maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "#e50914",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 28, fontWeight: 800, color: "#111", marginBottom: 8 }}>
            Admin Access
          </h1>
          <p style={{ fontSize: 14, color: "#999" }}>Only Goats FF — Tournament Control</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@onlygoats-ff.com"
                required
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 42px",
                  border: "1.5px solid #eaeaea",
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  color: "#111",
                  background: "#fff",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#111"; }}
                onBlur={(e) => { e.target.style.borderColor = "#eaeaea"; }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 42px",
                  border: "1.5px solid #eaeaea",
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  color: "#111",
                  background: "#fff",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#111"; }}
                onBlur={(e) => { e.target.style.borderColor = "#eaeaea"; }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{ marginTop: 8, width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Lock size={16} />}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
