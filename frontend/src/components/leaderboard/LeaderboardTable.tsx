"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Trophy, Swords, Target, Crown, Award, ChevronRight } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  rank: number;
  teamName: string;
  kills: number;
  points: number;
  wins: number;
  placement: string;
}

const DEMO: LeaderboardEntry[] = [
  { id: "1", rank: 1, teamName: "Team Alpha", kills: 48, points: 120, wins: 3, placement: "1st" },
  { id: "2", rank: 2, teamName: "Storm Squad", kills: 39, points: 98, wins: 2, placement: "2nd" },
  { id: "3", rank: 3, teamName: "Phantom Fury", kills: 35, points: 87, wins: 1, placement: "3rd" },
  { id: "4", rank: 4, teamName: "Iron Wolves", kills: 31, points: 79, wins: 1, placement: "4th" },
  { id: "5", rank: 5, teamName: "Black Ops", kills: 28, points: 71, wins: 0, placement: "5th" },
  { id: "6", rank: 6, teamName: "Titans", kills: 25, points: 64, wins: 0, placement: "6th" },
  { id: "7", rank: 7, teamName: "Shadow Crew", kills: 22, points: 58, wins: 0, placement: "7th" },
  { id: "8", rank: 8, teamName: "Hunters", kills: 19, points: 50, wins: 0, placement: "8th" },
];

const PODIUM_CONFIG = [
  { rank: 2, icon: "🥈", bg: "linear-gradient(135deg, #F3F4F6, #D1D5DB)", color: "#4B5563", badgeBg: "rgba(107, 114, 128, 0.1)", ring: "rgba(156, 163, 175, 0.3)" },
  { rank: 1, icon: "👑", bg: "linear-gradient(135deg, #FFFDF0, #FCD34D)", color: "#D97706", badgeBg: "rgba(217, 119, 6, 0.1)", ring: "rgba(251, 191, 36, 0.5)" },
  { rank: 3, icon: "🥉", bg: "linear-gradient(135deg, #FFF7ED, #FDBA74)", color: "#C2410C", badgeBg: "rgba(194, 65, 12, 0.1)", ring: "rgba(253, 186, 116, 0.3)" }
];

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(DEMO);

  useEffect(() => {
    try {
      const q = query(collection(db, "leaderboard"), orderBy("rank"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeaderboardEntry)));
        }
      });
      return () => unsub();
    } catch {
      // Use demo data
    }
  }, []);

  const top3 = [...entries]
    .slice(0, 3)
    .sort((a, b) => {
      // Order as: 2nd, 1st, 3rd
      if (a.rank === 1) return 0;
      if (b.rank === 1) return 0;
      return a.rank - b.rank; // sort remaining
    });

  // Reorder exactly to: [2nd Place, 1st Place, 3rd Place]
  const podiumEntries = [
    entries.find(e => e.rank === 2),
    entries.find(e => e.rank === 1),
    entries.find(e => e.rank === 3)
  ].filter(Boolean) as LeaderboardEntry[];

  return (
    <div>
      {/* 3D-feel Podium Section */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 20,
        marginBottom: 80,
        paddingTop: 40,
        flexWrap: "wrap",
      }}>
        {podiumEntries.map((entry) => {
          const conf = PODIUM_CONFIG.find(c => c.rank === entry.rank)!;
          const isFirst = entry.rank === 1;

          return (
            <div
              key={entry.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: isFirst ? 3 : 1,
              }}
            >
              {/* Profile Avatar Node */}
              <div
                style={{
                  width: isFirst ? 96 : 80,
                  height: isFirst ? 96 : 80,
                  borderRadius: "50%",
                  background: "#fff",
                  padding: 4,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  marginBottom: 16,
                  border: `3px solid ${isFirst ? "#e50914" : "#eaeaea"}`,
                }}
              >
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: conf.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isFirst ? 32 : 24,
                }}>
                  {conf.icon}
                </div>
                {/* Micro badge rank */}
                <div style={{
                  position: "absolute",
                  bottom: -6,
                  background: isFirst ? "#e50914" : "#111",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 100,
                  fontFamily: "Space Grotesk, sans-serif",
                }}>
                  #{entry.rank}
                </div>
              </div>

              {/* Team Name */}
              <h3 style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: isFirst ? 18 : 15,
                fontWeight: 700,
                color: "#111",
                marginBottom: 4,
                textAlign: "center",
              }}>
                {entry.teamName}
              </h3>
              <p style={{ fontSize: 13, color: "#666", fontWeight: 600, marginBottom: 16 }}>
                {entry.points} PTS
              </p>

              {/* Pedestal block */}
              <div
                style={{
                  width: isFirst ? 160 : 130,
                  height: isFirst ? 140 : 100,
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1.5px solid #eaeaea",
                  borderRadius: "20px 20px 0 0",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <span style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: isFirst ? 48 : 36,
                  fontWeight: 800,
                  color: conf.color,
                  lineHeight: 1,
                }}>
                  {entry.rank}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#999",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  {entry.wins} WINS
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table Grid */}
      <div style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid #eaeaea",
        borderRadius: 24,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.03)",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table className="premium-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #eaeaea" }}>
                <th style={{ width: 80, padding: "20px 24px" }}>Rank</th>
                <th style={{ padding: "20px 24px" }}>Squad Team</th>
                <th style={{ textAlign: "right", padding: "20px 24px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", color: "#666" }}>
                    <Swords size={14} /> KILLS
                  </span>
                </th>
                <th style={{ textAlign: "right", padding: "20px 24px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", color: "#666" }}>
                    <Target size={14} /> POINTS
                  </span>
                </th>
                <th style={{ textAlign: "right", padding: "20px 24px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", color: "#666" }}>
                    <Trophy size={14} /> WINS
                  </span>
                </th>
                <th style={{ textAlign: "right", padding: "20px 24px" }}>STAGE PLACEMENT</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isGold = entry.rank === 1;
                const isSilver = entry.rank === 2;
                const isBronze = entry.rank === 3;
                const isPodium = isGold || isSilver || isBronze;

                return (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: "1px solid #f2f2f2",
                      transition: "background 0.2s",
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            fontWeight: 800,
                            fontSize: 16,
                            color: isPodium ? "#e50914" : "#111",
                          }}
                        >
                          #{entry.rank}
                        </span>
                      </div>
                    </td>

                    {/* Team Profile & Details */}
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: isPodium
                              ? "linear-gradient(135deg, #111, #222)"
                              : "rgba(17, 17, 17, 0.04)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 800,
                            color: isPodium ? "#fff" : "#111",
                            fontFamily: "Space Grotesk, sans-serif",
                          }}
                        >
                          {isGold ? "🏆" : entry.teamName[0].toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#111", display: "block" }}>{entry.teamName}</span>
                          <span style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>ACTIVE SQUAD</span>
                        </div>
                      </div>
                    </td>

                    {/* Kills */}
                    <td style={{
                      textAlign: "right",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#111",
                      padding: "20px 24px"
                    }}>
                      {entry.kills}
                    </td>

                    {/* Points */}
                    <td style={{ textAlign: "right", padding: "20px 24px" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 800,
                          fontSize: 16,
                          color: isPodium ? "#e50914" : "#111",
                        }}
                      >
                        {entry.points}
                      </span>
                    </td>

                    {/* Wins */}
                    <td style={{
                      textAlign: "right",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#111",
                      padding: "20px 24px"
                    }}>
                      {entry.wins}
                    </td>

                    {/* Stage Placement */}
                    <td style={{ textAlign: "right", padding: "20px 24px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          background: isPodium ? "rgba(229,9,20,0.06)" : "rgba(17,17,17,0.04)",
                          color: isPodium ? "#e50914" : "#555",
                          border: isPodium ? "1px solid rgba(229,9,20,0.12)" : "1px solid #eaeaea",
                          padding: "5px 12px",
                          borderRadius: 100,
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                      >
                        {entry.placement}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
