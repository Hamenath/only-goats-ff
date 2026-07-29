"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Search } from "lucide-react";

export default function PlayersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      const all: any[] = [];
      snap.docs.forEach(d => {
        const reg = { id: d.id, ...d.data() } as any;
        all.push({ name: reg.captain?.name, uid: reg.captain?.uid, gameName: reg.captain?.gameName, role: "Captain", team: reg.teamName, status: reg.status, regId: reg.id });
        (reg.players || []).forEach((p: any) => {
          all.push({ name: p.name, uid: p.uid, gameName: p.gameName, role: "Player", team: reg.teamName, status: reg.status, regId: reg.id });
        });
        if (reg.substitute?.name) {
          all.push({ name: reg.substitute.name, uid: reg.substitute.uid, gameName: reg.substitute.gameName, role: "Substitute", team: reg.teamName, status: reg.status, regId: reg.id });
        }
      });
      setRows(all);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = rows.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.uid?.includes(search) || r.gameName?.toLowerCase().includes(search.toLowerCase()) ||
    r.team?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    Captain: { bg: "#FEF9C3", color: "#A16207" },
    Player: { bg: "#E0F2FE", color: "#0369A1" },
    Substitute: { bg: "#F1F5F9", color: "#475569" },
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Players</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{filtered.length} total players across all teams</p>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players, UIDs, teams..." style={{ padding: "8px 12px 8px 32px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#F8FAFC", outline: "none", width: 280, fontFamily: "Inter, sans-serif" }} />
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["Player", "UID", "Game Name", "Role", "Team", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.04em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <tr key={i}><td colSpan={6} style={{ padding: 14 }}><div style={{ height: 32, borderRadius: 6, background: "#F1F5F9" }} /></td></tr>)
              ) : filtered.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#EF4444" }}>
                        {r.name?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <code style={{ fontSize: 11, background: "#F1F5F9", padding: "3px 6px", borderRadius: 4, color: "#475569" }}>{r.uid || "—"}</code>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#0F172A" }}>{r.gameName || "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: ROLE_COLORS[r.role]?.bg, color: ROLE_COLORS[r.role]?.color }}>
                      {r.role}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#0F172A" }}>{r.team || "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: r.status === "approved" ? "#DCFCE7" : r.status === "rejected" ? "#FEE2E2" : "#FEF9C3", color: r.status === "approved" ? "#15803D" : r.status === "rejected" ? "#B91C1C" : "#A16207" }}>
                      {r.status || "pending"}
                    </span>
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
