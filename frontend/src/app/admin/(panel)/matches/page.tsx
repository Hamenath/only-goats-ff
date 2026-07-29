"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Plus, Trash2, Edit2, Check, X, Swords, Clock } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", map: "Bermuda", roomId: "", roomPassword: "", matchTime: "", round: "Qualifier", status: "upcoming", streamUrl: "" });

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "matches", editId), { ...form, updatedAt: serverTimestamp() });
        toast.success("Match updated");
        setEditId(null);
      } else {
        await addDoc(collection(db, "matches"), { ...form, createdAt: serverTimestamp() });
        toast.success("Match created");
      }
      setForm({ name: "", map: "Bermuda", roomId: "", roomPassword: "", matchTime: "", round: "Qualifier", status: "upcoming", streamUrl: "" });
      setShowForm(false);
    } catch { toast.error("Failed to save match"); }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "matches", id));
    setConfirmDelete(null);
    toast.success("Match deleted");
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "matches", id), { status });
    toast.success("Status updated");
  };

  const startEdit = (m: any) => {
    setForm({ name: m.name || "", map: m.map || "Bermuda", roomId: m.roomId || "", roomPassword: m.roomPassword || "", matchTime: m.matchTime || "", round: m.round || "Qualifier", status: m.status || "upcoming", streamUrl: m.streamUrl || "" });
    setEditId(m.id);
    setShowForm(true);
  };

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "Inter, sans-serif" } as React.CSSProperties;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Matches</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{matches.length} matches configured</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", map: "Bermuda", roomId: "", roomPassword: "", matchTime: "", round: "Qualifier", status: "upcoming", streamUrl: "" }); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={15} /> {showForm ? "Cancel" : "Create Match"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>{editId ? "Edit Match" : "Create Match"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {[
                { key: "name", label: "Match Name", placeholder: "Qualifier Round 1" },
                { key: "roomId", label: "Room ID", placeholder: "Enter room ID" },
                { key: "roomPassword", label: "Room Password", placeholder: "Enter password" },
                { key: "matchTime", label: "Match Time", placeholder: "", type: "datetime-local" },
                { key: "streamUrl", label: "Stream URL (optional)", placeholder: "https://youtube.com/..." },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
                  <input type={type || "text"} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inp} required={key !== "streamUrl"} />
                </div>
              ))}
              {[
                { key: "map", label: "Map", options: ["Bermuda", "Kalahari", "Purgatory", "Alpine"] },
                { key: "round", label: "Round", options: ["Qualifier", "Semi-Final", "Final", "Custom"] },
                { key: "status", label: "Status", options: ["upcoming", "live", "completed"] },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
                  <select value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ ...inp }}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", fontSize: 13, fontWeight: 600, color: "#64748B", cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={{ padding: "9px 18px", borderRadius: 8, background: "#EF4444", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {editId ? "Update Match" : "Create Match"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matches grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} style={{ height: 180, borderRadius: 16, background: "#F1F5F9" }} />)
        ) : matches.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>No matches yet. Create one above.</div>
        ) : matches.map(m => (
          <div key={m.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{m.name || "Unnamed Match"}</h3>
                <p style={{ fontSize: 12, color: "#64748B" }}>{m.round} • {m.map}</p>
              </div>
              <StatusBadge status={m.status || "upcoming"} pulse={m.status === "live"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Room ID", value: m.roomId || "—" },
                { label: "Password", value: m.roomPassword || "—" },
                { label: "Match Time", value: m.matchTime ? new Date(m.matchTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—" },
                { label: "Status", value: m.status || "upcoming" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["upcoming", "live", "completed"].map(s => (
                  <button key={s} onClick={() => updateStatus(m.id, s)} style={{
                    padding: "4px 10px", borderRadius: 6, border: "1px solid",
                    borderColor: m.status === s ? "#EF4444" : "#E2E8F0",
                    background: m.status === s ? "#FEF2F2" : "#F8FAFC",
                    color: m.status === s ? "#EF4444" : "#64748B",
                    fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => startEdit(m)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#E0F2FE", color: "#0369A1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setConfirmDelete(m.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete Match"
          message="Are you sure you want to delete this match? This cannot be undone."
          confirmLabel="Delete Match"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
