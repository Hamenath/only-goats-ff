"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, Save, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [adminDoc, setAdminDoc] = useState<any>(null);
  const [form, setForm] = useState({ displayName: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setForm({ displayName: u.displayName || "" });
        const snap = await getDoc(doc(db, "admins", u.uid));
        if (snap.exists()) setAdminDoc(snap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: form.displayName });
      await setDoc(doc(db, "admins", user.uid), { displayName: form.displayName, updatedAt: serverTimestamp() }, { merge: true });
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const initials = form.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || "AD";
  const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "Inter, sans-serif", background: "#FAFAFA" } as React.CSSProperties;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #E2E8F0", borderTopColor: "#EF4444", borderRadius: "50%", animation: "pfspin 0.8s linear infinite" }} />
      <style>{`@keyframes pfspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Profile</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Manage your admin account details</p>
      </div>

      {/* Avatar card */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24, marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{form.displayName || "Admin User"}</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>{user?.email}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} color="#EF4444" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>{adminDoc?.role || "Admin"}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>Account Details</h3>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Display Name</label>
            <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Your name" style={inp}
              onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Email (read-only)</label>
            <input value={user?.email || ""} disabled style={{ ...inp, background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>User ID</label>
            <code style={{ display: "block", padding: "10px 12px", borderRadius: 10, background: "#F1F5F9", border: "1px solid #E2E8F0", fontSize: 12, color: "#475569", fontFamily: "monospace" }}>
              {user?.uid || "—"}
            </code>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? <Loader2 size={15} style={{ animation: "pfspin 0.8s linear infinite" }} /> : <Save size={15} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
