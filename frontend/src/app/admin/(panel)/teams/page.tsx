"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Trash2, Search, LayoutGrid, List } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

export default function TeamsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = rows.filter(r => !search || r.teamName?.toLowerCase().includes(search.toLowerCase()) || r.captain?.name?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "registrations", id));
    setConfirmDelete(null);
    toast.success("Team removed");
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Teams</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{filtered.length} registered teams</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..." style={{ padding: "8px 12px 8px 32px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#F8FAFC", outline: "none", width: 220, fontFamily: "Inter, sans-serif" }} />
          </div>
          <div style={{ display: "flex", border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
            {([["grid", <LayoutGrid size={15} />], ["table", <List size={15} />]] as const).map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "8px 12px", background: view === v ? "#F8FAFC" : "#fff", border: "none", cursor: "pointer", color: view === v ? "#0F172A" : "#94A3B8", display: "flex", alignItems: "center" }}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {loading ? [...Array(6)].map((_, i) => <div key={i} style={{ height: 160, borderRadius: 16, background: "#F1F5F9" }} />) :
            filtered.map(r => (
              <div key={r.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#EF4444" }}>
                      {r.teamName?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{r.teamName || "—"}</h3>
                      <p style={{ fontSize: 11, color: "#94A3B8" }}>{r.teamId}</p>
                    </div>
                  </div>
                  <StatusBadge status={r.status || "pending"} />
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                  👑 Captain: <span style={{ fontWeight: 600, color: "#0F172A" }}>{r.captain?.name || "—"}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                  📱 {r.phone || "—"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>
                    {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}
                  </span>
                  <button onClick={() => setConfirmDelete(r.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              {["Team", "Captain", "Phone", "Players", "Status", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#EF4444" }}>{r.teamName?.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.teamName}</p>
                        <p style={{ fontSize: 11, color: "#94A3B8" }}>{r.teamId}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#0F172A" }}>{r.captain?.name || "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{r.phone || "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{(r.players?.length || 0) + 1} players</td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge status={r.status || "pending"} /></td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "#94A3B8" }}>{r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => setConfirmDelete(r.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal title="Remove Team" message="This will permanently remove the team registration." confirmLabel="Remove" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}
