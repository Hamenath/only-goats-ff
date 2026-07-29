"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc } from "firebase/firestore";
import { Plus, Trash2, Bell } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", description: "", priority: "normal" });

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "announcements"), { ...form, createdAt: serverTimestamp() });
      toast.success("Announcement published!");
      setForm({ title: "", subtitle: "", description: "", priority: "normal" });
      setShowForm(false);
    } catch { toast.error("Failed to publish"); }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "announcements", id));
    setConfirmDelete(null);
    toast.success("Announcement deleted");
  };

  const PRIORITY_COLORS: Record<string, string> = {
    high: "#DC2626", normal: "#0369A1", low: "#64748B",
  };

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "Inter, sans-serif" } as React.CSSProperties;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Announcements</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Publish notices visible on the public website</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={15} /> New Announcement
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>New Announcement</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" style={inp} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short subtitle" style={inp} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Full announcement content..." rows={4} style={{ ...inp, resize: "vertical" }} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={inp}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High — Urgent</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", fontSize: 13, fontWeight: 600, color: "#64748B", cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={{ padding: "9px 18px", borderRadius: 8, background: "#EF4444", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Publish</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} style={{ height: 100, borderRadius: 16, background: "#F1F5F9" }} />)
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>No announcements yet.</div>
        ) : items.map(item => (
          <div key={item.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: (PRIORITY_COLORS[item.priority] || "#0369A1") + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bell size={16} color={PRIORITY_COLORS[item.priority] || "#0369A1"} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{item.title}</h3>
                  {item.subtitle && <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{item.subtitle}</p>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: (PRIORITY_COLORS[item.priority] || "#0369A1") + "15", color: PRIORITY_COLORS[item.priority] || "#0369A1" }}>
                    {item.priority || "normal"}
                  </span>
                  <button onClick={() => setConfirmDelete(item.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{item.description}</p>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
                {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString("en-IN") : "Just now"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal title="Delete Announcement" message="Are you sure you want to delete this announcement? It will disappear from the public website."
          confirmLabel="Delete" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}
