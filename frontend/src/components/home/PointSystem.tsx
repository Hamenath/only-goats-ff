"use client";

import { Trophy, Swords, ShieldCheck, Zap } from "lucide-react";

export function PointSystem() {
  const placements = [
    { place: "1st (Booyah!)", points: 12, highlight: true },
    { place: "2nd Place", points: 10, highlight: false },
    { place: "3rd Place", points: 8, highlight: false },
    { place: "4th Place", points: 6, highlight: false },
    { place: "5th Place", points: 5, highlight: false },
    { place: "6th Place", points: 4, highlight: false },
    { place: "7th Place", points: 3, highlight: false },
    { place: "8th Place", points: 2, highlight: false },
    { place: "9th–12th Place", points: 1, highlight: false },
    { place: "13th+ Place", points: 0, highlight: false },
  ];

  return (
    <section style={{ padding: "100px 0", background: "#fafafa", borderTop: "1px solid #eaeaea" }}>
      <div className="container-custom">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p className="section-tag" style={{ marginBottom: 12 }}>Scoring Rules</p>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Point System
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 520, margin: "0 auto" }}>
            Rankings are determined by total points — placement points + kill points.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "start" }}>
          {/* Placement Points Table Card */}
          <div className="glass-card" style={{ padding: "36px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 10 }}>
                <Trophy size={20} color="#e50914" /> Placement Points
              </h3>
              <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(229,9,20,0.08)", color: "#e50914", padding: "4px 12px", borderRadius: 100 }}>
                Per Match
              </span>
            </div>

            <table className="premium-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ paddingBottom: 16 }}>Placement Rank</th>
                  <th style={{ textAlign: "right", paddingBottom: 16 }}>Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {placements.map(({ place, points, highlight }) => (
                  <tr key={place}>
                    <td style={{ fontWeight: highlight ? 800 : 600, fontSize: 14, color: highlight ? "#111" : "#555" }}>
                      {place}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 800,
                          fontSize: 16,
                          color: highlight ? "#e50914" : points >= 6 ? "#111" : "#999",
                        }}
                      >
                        {points} PTS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tournament & Scoring Format Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="glass-card" style={{ padding: "36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(229,9,20,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Swords size={20} color="#e50914" />
                </div>
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 800, color: "#111" }}>
                  Scoring Rule
                </h3>
              </div>

              {/* Win Rule */}
              <div style={{ background: "#ffffff", border: "1px solid #eaeaea", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#111", fontFamily: "Space Grotesk, sans-serif" }}>Match Victory (Win)</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Awarded per match win</div>
                </div>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 900, color: "#10b981" }}>
                  +2 PTS
                </span>
              </div>

              {/* Lose Rule */}
              <div style={{ background: "#ffffff", border: "1px solid #eaeaea", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#111", fontFamily: "Space Grotesk, sans-serif" }}>Match Defeat (Lose)</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Defeat or no victory</div>
                </div>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 900, color: "#999" }}>
                  0 PTS
                </span>
              </div>

              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                Every match victory achieved by your squad awards <strong>+2 points</strong>. Losing a match yields <strong>0 points</strong>.
              </p>
            </div>

            <div className="glass-card" style={{ padding: "36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={20} color="#10b981" />
                </div>
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 800, color: "#111" }}>
                  CS League Format
                </h3>
              </div>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 16 }}>
                24 teams compete in a round-robin league format. Accumulated points from all matches determine overall standings. The top 4 teams advance to the semifinals using the combined placement + kill scoring system.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.08)", padding: "10px 16px", borderRadius: 12 }}>
                <Zap size={16} /> Top 4 Squads Qualify For Semifinals
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PointSystem;
