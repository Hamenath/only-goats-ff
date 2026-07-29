"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Plus, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", displayName: "", role: "admin" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "admins"), snap => {
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, "admins"), {
        email: form.email, displayName: form.displayName, role: form.role,
        createdAt: serverTimestamp(),
      });
      toast.success("Admin record added! They must sign in to link their account.");
      setForm({ email: "", displayName: "", role: "admin" });
      setShowForm(false);
    } catch { toast.error("Failed to add admin"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "admins", id));
    setConfirmDelete(null);
    toast.success("Admin removed");
  };

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "Inter, sans-serif", background: "#FAFAFA" } as React.CSSProperties;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Admins</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Manage admin access and roles</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={15} /> Add Admin
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Add Admin</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
              {[
                { key: "displayName", label: "Display Name", placeholder: "Admin User" },
                { key: "email", label: "Email", placeholder: "admin@example.com" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</label>
                  <input type={key === "email" ? "email" : "text"} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} required style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inp}>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "#FEF9C3", border: "1px solid #FDE68A", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#A16207" }}>
                ⚠️ This adds the admin record to Firestore. The user must <strong>sign in with their email/password</strong> first via Firebase Authentication. Their UID will be matched on login.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", fontSize: 13, fontWeight: 600, color: "#64748B", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: "9px 18px", borderRadius: 8, background: "#EF4444", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add Admin</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
            {["Admin", "Email", "Role", "Added", "Actions"].map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} style={{ padding: 14 }}><div style={{ height: 36, borderRadius: 6, background: "#F1F5F9" }} /></td></tr>)
              : admins.map(a => (
                <tr key={a.id} style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: a.role === "super-admin" ? "#FEF2F2" : "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {a.role === "super-admin" ? <ShieldCheck size={18} color="#EF4444" /> : <ShieldAlert size={18} color="#0369A1" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{a.displayName || "Admin"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B" }}>{a.email || a.id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: a.role === "super-admin" ? "#FEF2F2" : "#E0F2FE", color: a.role === "super-admin" ? "#DC2626" : "#0369A1" }}>
                      {a.role || "admin"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#94A3B8" }}>{a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => setConfirmDelete(a.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && <ConfirmModal title="Remove Admin" message="This admin will lose access to the panel. Their Firebase Auth account won't be affected." confirmLabel="Remove" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}
