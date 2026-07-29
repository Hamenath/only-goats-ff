"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "admins", cred.user.uid));
      if (snap.exists() && (snap.data().role === "super-admin" || snap.data().role === "superadmin" || snap.data().role === "admin")) {
        router.push("/admin/dashboard");
      } else {
        await auth.signOut();
        router.push("/admin/unauthorized");
      }
    } catch (err: any) {
      const msg = err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password"
        ? "Invalid email or password."
        : err?.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : "Authentication failed. Check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { setDoc, serverTimestamp } = await import("firebase/firestore");
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      
      if (cred.user) {
        const adminRef = doc(db, "admins", cred.user.uid);
        const snap = await getDoc(adminRef);
        
        // Google logins on the admin panel are automatically registered and saved as super-admins
        if (!snap.exists()) {
          await setDoc(adminRef, {
            email: cred.user.email,
            displayName: cred.user.displayName || "Google Admin",
            role: "super-admin",
            createdAt: serverTimestamp()
          });
        }
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const inp = (focused: boolean): React.CSSProperties => ({
    width: "100%", padding: "11px 14px 11px 42px",
    border: `1.5px solid ${focused ? "#EF4444" : "#E2E8F0"}`,
    borderRadius: 12, fontSize: 14, color: "#0F172A",
    background: "#fff", outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 0.15s",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #FFF1F2 100%)",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: "none", alignItems: "center", justifyContent: "center",
        padding: 48, background: "#0F172A",
      }}
        className="admin-login-left"
      >
        <div style={{ maxWidth: 360, color: "#fff" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: "#EF4444",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32,
          }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Only Goats FF<br />Admin Panel
          </h1>
          <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.7 }}>
            Manage tournaments, players, registrations, and live matches from one powerful dashboard.
          </p>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {["Real-time Firestore Sync", "Secure Role-based Access", "Cloudinary Media Management"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: 13, color: "#CBD5E1" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{
          width: "100%", maxWidth: 420,
          background: "#FFFFFF", borderRadius: 20,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 40px -8px rgba(0,0,0,0.08)",
          padding: "40px 36px",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 13, color: "#64748B" }}>
              Sign in to your admin account to continue
            </p>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 10,
              background: "#FEF2F2", border: "1px solid #FECACA",
              marginBottom: 20,
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: "0.02em" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@onlygoats-ff.com" required
                  style={inp(false)}
                  onFocus={e => { e.target.style.borderColor = "#EF4444"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: 12, color: "#EF4444", textDecoration: "none", fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inp(false), paddingRight: 42 }}
                  onFocus={e => { e.target.style.borderColor = "#EF4444"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; }}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 2,
                  }}
                >
                  {showPass ? <EyeOff size={15} color="#94A3B8" /> : <Eye size={15} color="#94A3B8" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: "#EF4444" }}
              />
              <span style={{ fontSize: 13, color: "#64748B" }}>Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? "#F87171" : "#EF4444",
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "Inter, sans-serif", transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#DC2626"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#EF4444"; }}
            >
              {loading ? <Loader2 size={16} style={{ animation: "lspin 0.8s linear infinite" }} /> : <Lock size={16} />}
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            </div>

            {/* Google Sign In */}
            <button
              type="button" onClick={handleGoogleLogin} disabled={loading}
              style={{
                width: "100%", padding: "11px",
                background: "#ffffff",
                color: "#1F2937", border: "1px solid #D1D5DB", borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontFamily: "Inter, sans-serif", transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94A3B8" }}>
            Only authorized administrators may access this panel.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes lspin { to { transform: rotate(360deg); } }
        @media (min-width: 900px) { .admin-login-left { display: flex !important; } }
      `}</style>
    </div>
  );
}
