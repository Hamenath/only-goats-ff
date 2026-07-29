"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { Save, Trophy } from "lucide-react";
import toast from "react-hot-toast";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, any>>({});

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("points", "desc"));
    const unsub = onSnapshot(q, snap => {
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (id: string, field: string, value: string) => {
    setEditing(e => ({ ...e, [id]: { ...(e[id] || {}), [field]: value } }));
  };

  const saveRow = async (id: string) => {
    const data = editing[id] || {};
    const kills = parseInt(data.kills ?? rows.find(r => r.id === id)?.kills ?? 0);
    const placement = parseInt(data.placement ?? rows.find(r => r.id === id)?.placement ?? 0);
    const wins = parseInt(data.wins ?? rows.find(r => r.id === id)?.wins ?? 0);
    const losses = parseInt(data.losses ?? rows.find(r => r.id === id)?.losses ?? 0);
    const points = kills * 1 + placement + wins * 3;
    await updateDoc(doc(db, "leaderboard", id), { kills, placement, wins, losses, points, teamName: data.teamName ?? rows.find(r => r.id === id)?.teamName });
    setEditing(e => { const n = { ...e }; delete n[id]; return n; });
    toast.success("Leaderboard updated");
  };

  const sorted = [...rows].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  const inp = (id: string, field: string, base: any) => ({
    value: editing[id]?.[field] !== undefined ? editing[id][field] : (base ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(id, field, e.target.value),
    style: {
      width: 72, padding: "5px 8px", borderRadius: 6, border: "1px solid #E2E8F0",
      fontSize: 12, color: "#0F172A", textAlign: "center" as const,
      background: editing[id]?.[field] !== undefined ? "#FEF9C3" : "#F8FAFC",
      outline: "none", fontFamily: "Inter, sans-serif",
    } as React.CSSProperties,
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Leaderboard</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Edit kills, placement and wins — points auto-calculate (1pt/kill + placement + 3pt/win)</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["Rank", "Team", "Kills", "Placement", "Wins", "Losses", "Total Points", "Save"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: h === "Rank" ? "center" : "left", fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8} style={{ padding: 14 }}><div style={{ height: 36, borderRadius: 6, background: "#F1F5F9" }} /></td></tr>)
              ) : sorted.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, margin: "0 auto",
                      background: i === 0 ? "#FEF9C3" : i === 1 ? "#F1F5F9" : i === 2 ? "#FEE2E2" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      color: i === 0 ? "#CA8A04" : i === 1 ? "#475569" : i === 2 ? "#DC2626" : "#94A3B8",
                    }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <input {...{ value: editing[r.id]?.teamName !== undefined ? editing[r.id].teamName : (r.teamName ?? ""), onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(r.id, "teamName", e.target.value) }} style={{ width: 140, padding: "5px 8px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 13, fontWeight: 600, color: "#0F172A", background: editing[r.id]?.teamName !== undefined ? "#FEF9C3" : "transparent", outline: "none", fontFamily: "Inter, sans-serif" }} />
                  </td>
                  <td style={{ padding: "10px 14px" }}><input type="number" {...inp(r.id, "kills", r.kills)} min={0} /></td>
                  <td style={{ padding: "10px 14px" }}><input type="number" {...inp(r.id, "placement", r.placement)} min={0} /></td>
                  <td style={{ padding: "10px 14px" }}><input type="number" {...inp(r.id, "wins", r.wins)} min={0} /></td>
                  <td style={{ padding: "10px 14px" }}><input type="number" {...inp(r.id, "losses", r.losses)} min={0} /></td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#EF4444" }}>{r.points ?? 0}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {editing[r.id] && (
                      <button onClick={() => saveRow(r.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 7, background: "#EF4444", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <Save size={12} /> Save
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
