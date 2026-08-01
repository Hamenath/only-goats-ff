"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  setDoc,
  doc,
  query,
  orderBy,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { Save, Trophy, RefreshCw, Users, Swords, Zap, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { getPlacementPoints } from "@/config/scoring";

interface LeaderboardRow {

  id: string;
  rank?: number;
  teamId?: string;
  teamName?: string;
  kills?: number;
  placement?: number;
  placementPoints?: number;
  wins?: number;
  losses?: number;
  points?: number;
  updatedAt?: any;
  [key: string]: any;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [editing, setEditing] = useState<Record<string, any>>({});

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("points", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const fetched: LeaderboardRow[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

      // Always pad display up to 24 squads in Admin table
      const list: LeaderboardRow[] = [...fetched];
      while (list.length < 24) {
        const r = list.length + 1;
        list.push({
          id: `slot_${r}`,
          rank: r,
          teamName: `Squad Slot #${r}`,
          kills: 0,
          placement: r,
          placementPoints: getPlacementPoints(r),
          wins: 0,
          losses: 0,
          points: getPlacementPoints(r),
        });
      }

      setRows(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  // Sync registered teams & seed all 24 squad slots into Firestore leaderboard collection
  const syncRegisteredTeams = async () => {
    setSyncing(true);
    try {
      const regSnap = await getDocs(collection(db, "registrations"));
      const leadSnap = await getDocs(collection(db, "leaderboard"));
      const regTeams = regSnap.docs.map((d) => d.data());

      const batch = writeBatch(db);
      let updatedCount = 0;

      // Seed/Sync all 24 squad slots into Firestore
      for (let i = 0; i < 24; i++) {
        const slotRank = i + 1;
        const reg = regTeams[i];
        const defaultName = reg?.teamName
          ? reg.teamName.trim()
          : (i < 3 ? ["Only Goats", "Vortex Gaming", "Apex Predators"][i] : `Squad Slot #${slotRank}`);
        
        const killsCount = i === 0 ? 24 : i === 1 ? 17 : i === 2 ? 10 : 0;
        const placePts = getPlacementPoints(slotRank);
        const totalPts = killsCount + placePts;

        if (i < leadSnap.docs.length) {
          const existingDoc = leadSnap.docs[i];
          const exData = existingDoc.data();
          if (reg?.teamName && (exData.teamName?.startsWith("Squad Slot #") || !exData.teamName)) {
            batch.update(existingDoc.ref, {
              teamName: reg.teamName.trim(),
              teamId: reg.teamId || regSnap.docs[i]?.id,
              updatedAt: serverTimestamp(),
            });
            updatedCount++;
          }
        } else {
          const leadRef = doc(collection(db, "leaderboard"));
          batch.set(leadRef, {
            teamId: reg?.teamId || `squad_slot_${slotRank}`,
            teamName: defaultName,
            kills: killsCount,
            placement: slotRank,
            placementPoints: placePts,
            wins: slotRank === 1 ? 1 : 0,
            losses: 0,
            points: totalPts,
            rank: slotRank,
            updatedAt: serverTimestamp(),
          });
          updatedCount++;
        }
      }

      await batch.commit();
      toast.success("⚡ Synced & populated all 24 Squad slots on Leaderboard!");
    } catch (err: any) {
      toast.error(err.message || "Failed to sync registered teams");
    } finally {
      setSyncing(false);
    }
  };

  const handleChange = (id: string, field: string, value: string) => {
    setEditing((e) => ({ ...e, [id]: { ...(e[id] || {}), [field]: value } }));
  };

  const saveRow = async (id: string) => {
    const data = editing[id] || {};
    const current = rows.find((r) => r.id === id) || ({} as LeaderboardRow);

    const kills = Math.max(0, parseInt(data.kills !== undefined ? data.kills : (current.kills ?? 0)) || 0);
    const placement = Math.max(0, parseInt(data.placement !== undefined ? data.placement : (current.placement ?? 0)) || 0);
    const wins = Math.max(0, parseInt(data.wins !== undefined ? data.wins : (current.wins ?? 0)) || 0);
    const losses = Math.max(0, parseInt(data.losses !== undefined ? data.losses : (current.losses ?? 0)) || 0);

    const placePts = placement > 0 ? getPlacementPoints(placement) : 0;
    const points = placePts + kills * 1;
    const teamName = (data.teamName !== undefined ? data.teamName : (current.teamName ?? "")).trim();

    const payload = {
      teamName,
      teamId: current.teamId || `squad_${id}`,
      kills,
      placement,
      placementPoints: placePts,
      wins,
      losses,
      points,
      updatedAt: serverTimestamp(),
    };

    if (id.startsWith("slot_")) {
      const newRef = doc(collection(db, "leaderboard"));
      await setDoc(newRef, payload);
    } else {
      await updateDoc(doc(db, "leaderboard", id), payload);
    }

    setEditing((e) => {
      const n = { ...e };
      delete n[id];
      return n;
    });
    toast.success(`Leaderboard updated for ${teamName}`);
  };

  const saveAllRows = async () => {
    setSavingAll(true);
    try {
      const editedIds = Object.keys(editing);
      if (editedIds.length === 0) {
        toast("No unsaved modifications detected.");
        setSavingAll(false);
        return;
      }

      const batch = writeBatch(db);
      editedIds.forEach((id) => {
        const data = editing[id] || {};
        const current = rows.find((r) => r.id === id) || ({} as LeaderboardRow);


        const kills = Math.max(0, parseInt(data.kills !== undefined ? data.kills : (current.kills ?? 0)) || 0);
        const placement = Math.max(0, parseInt(data.placement !== undefined ? data.placement : (current.placement ?? 0)) || 0);
        const wins = Math.max(0, parseInt(data.wins !== undefined ? data.wins : (current.wins ?? 0)) || 0);
        const losses = Math.max(0, parseInt(data.losses !== undefined ? data.losses : (current.losses ?? 0)) || 0);

        const placePts = placement > 0 ? getPlacementPoints(placement) : 0;
        const points = placePts + kills * 1;
        const teamName = (data.teamName !== undefined ? data.teamName : (current.teamName ?? "")).trim();

        const payload = {
          teamName,
          teamId: current.teamId || `squad_${id}`,
          kills,
          placement,
          placementPoints: placePts,
          wins,
          losses,
          points,
          updatedAt: serverTimestamp(),
        };

        if (id.startsWith("slot_")) {
          const newRef = doc(collection(db, "leaderboard"));
          batch.set(newRef, payload);
        } else {
          const ref = doc(db, "leaderboard", id);
          batch.update(ref, payload);
        }
      });

      await batch.commit();
      setEditing({});
      toast.success(`All ${editedIds.length} team updates saved!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save all updates");
    } finally {
      setSavingAll(false);
    }
  };


  const sorted = [...rows].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  const inp = (id: string, field: string, base: any) => ({
    value: editing[id]?.[field] !== undefined ? editing[id][field] : (base ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(id, field, e.target.value),
    style: {
      width: 72,
      padding: "6px 8px",
      borderRadius: 6,
      border: "1px solid #CBD5E1",
      fontSize: 13,
      color: "#0F172A",
      textAlign: "center" as const,
      fontWeight: 700,
      background: editing[id]?.[field] !== undefined ? "#FEF9C3" : "#F8FAFC",
      outline: "none",
      fontFamily: "Inter, sans-serif",
    } as React.CSSProperties,
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Top Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={22} color="#DC2626" /> Tournament Leaderboard ({rows.length} Squads)
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Edit match kills & placement rank — points auto-calculate using Official Free Fire Matrix (1st: 12, 2nd: 9, 3rd: 8... + 1pt/kill)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={syncRegisteredTeams}
            disabled={syncing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              background: "#0284C7",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: syncing ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw size={15} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
            {syncing ? "Syncing Squads..." : "Sync 24 Registered Squads"}
          </button>

          {Object.keys(editing).length > 0 && (
            <button
              onClick={saveAllRows}
              disabled={savingAll}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                background: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: savingAll ? "not-allowed" : "pointer",
                boxShadow: "0 2px 10px rgba(220,38,38,0.2)",
              }}
            >
              <Save size={15} /> Save All Changes ({Object.keys(editing).length})
            </button>
          )}
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["Rank", "Squad Team", "Placement Rank", "Place PTS", "Kills", "Wins", "Losses", "Total Points", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 14px",
                      textAlign: h === "Rank" ? "center" : h === "Squad Team" ? "left" : "right",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} style={{ padding: 14 }}>
                      <div style={{ height: 38, borderRadius: 6, background: "#F1F5F9" }} />
                    </td>
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
                    No squads on the leaderboard yet. Click <strong>"Sync 24 Registered Squads"</strong> above to auto-populate.
                  </td>
                </tr>
              ) : (
                sorted.map((r, i) => {
                  const placeVal = parseInt(editing[r.id]?.placement ?? r.placement ?? 0) || 0;
                  const killsVal = parseInt(editing[r.id]?.kills ?? r.kills ?? 0) || 0;
                  const computedPlacePts = placeVal > 0 ? getPlacementPoints(placeVal) : 0;
                  const computedTotal = computedPlacePts + killsVal;

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        background: editing[r.id] ? "#FEFCE8" : i < 3 ? "#FFFDF0" : "transparent",
                      }}
                    >
                      {/* Rank Badge */}
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            margin: "0 auto",
                            background: i === 0 ? "#FEF9C3" : i === 1 ? "#F1F5F9" : i === 2 ? "#FFF7ED" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 800,
                            color: i === 0 ? "#CA8A04" : i === 1 ? "#475569" : i === 2 ? "#C2410C" : "#64748B",
                          }}
                        >
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </div>
                      </td>

                      {/* Squad Team Name */}
                      <td style={{ padding: "12px 14px" }}>
                        <input
                          value={editing[r.id]?.teamName !== undefined ? editing[r.id].teamName : (r.teamName ?? "")}
                          onChange={(e) => handleChange(r.id, "teamName", e.target.value)}
                          placeholder="Team Name"
                          style={{
                            width: 160,
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #CBD5E1",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0F172A",
                            background: editing[r.id]?.teamName !== undefined ? "#FEF9C3" : "#FFFFFF",
                            outline: "none",
                            fontFamily: "Inter, sans-serif",
                          }}
                        />
                      </td>

                      {/* Placement Rank Input */}
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <input type="number" min={0} max={24} {...inp(r.id, "placement", r.placement)} />
                      </td>

                      {/* Place Points Badge */}
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#0284C7", fontSize: 13 }}>
                        +{computedPlacePts} pts
                      </td>

                      {/* Kills */}
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <input type="number" min={0} {...inp(r.id, "kills", r.kills)} />
                      </td>

                      {/* Wins */}
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <input type="number" min={0} {...inp(r.id, "wins", r.wins)} />
                      </td>

                      {/* Losses */}
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <input type="number" min={0} {...inp(r.id, "losses", r.losses)} />
                      </td>

                      {/* Total Points */}
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: "#DC2626" }}>
                          {computedTotal} PTS
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        {editing[r.id] ? (
                          <button
                            onClick={() => saveRow(r.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "6px 12px",
                              borderRadius: 7,
                              background: "#DC2626",
                              color: "#fff",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(220,38,38,0.2)",
                            }}
                          >
                            <Save size={13} /> Save
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>Synced</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

