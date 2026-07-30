"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Save,
  Loader2,
  RefreshCw,
  Swords,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

interface TeamRegistration {
  id: string;
  teamId: string;
  teamName: string;
  captainName: string;
  allocatedStage: string;
  qualificationStatus: string;
}

interface TeamScoreInput {
  teamId: string;
  teamName: string;
  placement: number;
  kills: number;
  placementPoints: number;
  totalPoints: number;
}

const PLACEMENT_POINTS_MAP: Record<number, number> = {
  1: 12,
  2: 9,
  3: 7,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
};

export default function ResultsPage() {
  const [stage, setStage] = useState<string>("Qualifier 1");
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [scores, setScores] = useState<Record<string, TeamScoreInput>>({});
  const [saving, setSaving] = useState(false);
  const [triggeringQualify, setTriggeringQualify] = useState(false);

  // Real-time Firestore Subscription for Stage Teams
  useEffect(() => {
    const q = query(
      collection(db, "registrations"),
      where("allocatedStage", "==", stage)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          teamId: data.teamId,
          teamName: data.teamName,
          captainName: data.captain?.name || "N/A",
          allocatedStage: data.allocatedStage,
          qualificationStatus: data.qualificationStatus || "pending",
        } as TeamRegistration;
      });

      setTeams(list);

      // Initialize default score input state
      const initialScores: Record<string, TeamScoreInput> = {};
      list.forEach((t, index) => {
        const p = index + 1;
        const placePts = PLACEMENT_POINTS_MAP[p] || 0;
        initialScores[t.teamId] = {
          teamId: t.teamId,
          teamName: t.teamName,
          placement: p,
          kills: 0,
          placementPoints: placePts,
          totalPoints: placePts,
        };
      });
      setScores(initialScores);
    });

    return () => unsub();
  }, [stage]);

  // Handle Score Input Changes
  const handleScoreChange = (teamId: string, field: "placement" | "kills", val: number) => {
    setScores((prev) => {
      const item = prev[teamId] || { teamId, teamName: "", placement: 1, kills: 0, placementPoints: 12, totalPoints: 12 };
      const newPlacement = field === "placement" ? Math.max(1, Math.min(12, val)) : item.placement;
      const newKills = field === "kills" ? Math.max(0, val) : item.kills;
      const placementPts = PLACEMENT_POINTS_MAP[newPlacement] || 0;
      const total = placementPts + newKills;

      return {
        ...prev,
        [teamId]: {
          ...item,
          placement: newPlacement,
          kills: newKills,
          placementPoints: placementPts,
          totalPoints: total,
        },
      };
    });
  };

  // Save Scores to Firestore Leaderboards Collection
  const handleSaveScores = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      Object.values(scores).forEach((sc) => {
        const ref = doc(db, "leaderboards", `${stage}_${sc.teamId}`);
        batch.set(
          ref,
          {
            stage,
            teamId: sc.teamId,
            teamName: sc.teamName,
            placement: sc.placement,
            kills: sc.kills,
            placementPoints: sc.placementPoints,
            totalPoints: sc.totalPoints,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      });
      await batch.commit();
      toast.success(`Match scores saved for ${stage}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save scores");
    } finally {
      setSaving(false);
    }
  };

  // Automated Qualification Engine Trigger (Top 6 Qualify, Rest Eliminated)
  const handleExecuteAutoQualification = async () => {
    setTriggeringQualify(true);
    try {
      // Sort teams by total points descending
      const sortedTeams = Object.values(scores).sort((a, b) => b.totalPoints - a.totalPoints);
      if (sortedTeams.length === 0) {
        toast.error("No team scores available to evaluate.");
        setTriggeringQualify(false);
        return;
      }

      const batch = writeBatch(db);
      let qualifiedCount = 0;
      let eliminatedCount = 0;

      for (let i = 0; i < teams.length; i++) {
        const t = teams[i];
        const rank = sortedTeams.findIndex((sc) => sc.teamId === t.teamId) + 1;
        const isQualified = rank <= 6;
        const newStatus = isQualified ? "qualified_round_2" : "eliminated";

        if (isQualified) qualifiedCount++;
        else eliminatedCount++;

        // Update registration qualification status
        const regRef = doc(db, "registrations", t.id);
        batch.update(regRef, {
          qualificationStatus: newStatus,
          updatedAt: serverTimestamp(),
        });

        // Add Automated Notification
        const notifRef = doc(collection(db, "notifications"));
        batch.set(notifRef, {
          teamId: t.teamId,
          title: isQualified ? "🎉 Congratulations! Qualified for Round 2" : "❌ Eliminated - Premium Pass Unlocked",
          message: isQualified
            ? `Your team ${t.teamName} (${t.teamId}) ranked #${rank} with ${scores[t.teamId]?.totalPoints || 0} pts in ${stage} and has qualified for Round 2!`
            : `Your team ${t.teamName} (${t.teamId}) finished #${rank} in ${stage}. Only Goats Premium Pass re-entry (₹40) is now unlocked on your Dashboard.`,
          type: isQualified ? "qualification" : "elimination",
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();
      toast.success(`⚡ Automated Qualification Executed! ${qualifiedCount} Qualified, ${eliminatedCount} Eliminated.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to execute auto qualification");
    } finally {
      setTriggeringQualify(false);
    }
  };

  const sortedList = [...teams].sort((a, b) => {
    const ptsA = scores[a.teamId]?.totalPoints || 0;
    const ptsB = scores[b.teamId]?.totalPoints || 0;
    return ptsB - ptsA;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>
            🏆 Results & Automated Qualification Engine
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Input match kills & placements. Auto-calculates points, ranks squads, and advances Top 6 to Round 2.
          </p>
        </div>

        {/* Stage Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>SELECT STAGE:</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid #CBD5E1",
              fontSize: 13,
              fontWeight: 700,
              color: "#0F172A",
              background: "#FFFFFF",
              outline: "none",
            }}
          >
            <option value="Qualifier 1">Qualifier 1 (Teams 1-12)</option>
            <option value="Qualifier 2">Qualifier 2 (Teams 13-24)</option>
            <option value="Round 2">Round 2 (Qualified + Premium)</option>
            <option value="Grand Final">Grand Final Showdown</option>
          </select>
        </div>
      </div>

      {/* Main Scorecard Table */}
      <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24, marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
            📊 {stage} Match Results ({teams.length} Teams)
          </h3>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleSaveScores}
              disabled={saving || teams.length === 0}
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
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
              Save Scores
            </button>

            <button
              onClick={handleExecuteAutoQualification}
              disabled={triggeringQualify || teams.length === 0}
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
                cursor: triggeringQualify ? "not-allowed" : "pointer",
                boxShadow: "0 2px 10px rgba(220,38,38,0.2)",
              }}
            >
              {triggeringQualify ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Zap size={16} />
              )}
              Execute Auto Qualification (Top 6)
            </button>
          </div>
        </div>

        {teams.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
            No registered teams allocated to {stage} yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left" }}>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>RANK</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>SQUAD ID</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>TEAM NAME</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>PLACEMENT RANK</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>PLACE PTS</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>KILLS</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>TOTAL PTS</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((t, index) => {
                  const rank = index + 1;
                  const sc = scores[t.teamId] || { placement: rank, kills: 0, placementPoints: PLACEMENT_POINTS_MAP[rank] || 0, totalPoints: PLACEMENT_POINTS_MAP[rank] || 0 };
                  const isTop6 = rank <= 6;

                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #F1F5F9", background: isTop6 ? "#F0FDF4" : "transparent" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: isTop6 ? "#16A34A" : "#64748B" }}>
                        #{rank}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, fontFamily: "monospace" }}>
                        {t.teamId}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0F172A" }}>
                        {t.teamName}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={sc.placement}
                          onChange={(e) => handleScoreChange(t.teamId, "placement", parseInt(e.target.value) || 1)}
                          style={{ width: 60, padding: "6px 8px", borderRadius: 6, border: "1px solid #CBD5E1", textAlign: "center", fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0284C7" }}>
                        +{sc.placementPoints} pts
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <input
                          type="number"
                          min={0}
                          value={sc.kills}
                          onChange={(e) => handleScoreChange(t.teamId, "kills", parseInt(e.target.value) || 0)}
                          style={{ width: 60, padding: "6px 8px", borderRadius: 6, border: "1px solid #CBD5E1", textAlign: "center", fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 900, color: "#DC2626", fontSize: 14 }}>
                        {sc.totalPoints} PTS
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {t.qualificationStatus === "qualified_round_2" ? (
                          <span style={{ padding: "4px 8px", borderRadius: 6, background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 800 }}>
                            QUALIFIED
                          </span>
                        ) : t.qualificationStatus === "eliminated" ? (
                          <span style={{ padding: "4px 8px", borderRadius: 6, background: "#FEE2E2", color: "#DC2626", fontSize: 11, fontWeight: 800 }}>
                            ELIMINATED
                          </span>
                        ) : isTop6 ? (
                          <span style={{ padding: "4px 8px", borderRadius: 6, background: "#E0F2FE", color: "#0284C7", fontSize: 11, fontWeight: 800 }}>
                            TOP 6 SLOT
                          </span>
                        ) : (
                          <span style={{ padding: "4px 8px", borderRadius: 6, background: "#F1F5F9", color: "#64748B", fontSize: 11, fontWeight: 700 }}>
                            PENDING
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
