"use client";

import { Trophy, Swords, ShieldCheck, Zap, Flame, Crosshair } from "lucide-react";
import { PLACEMENT_RULES, KILL_POINT_VALUE, SCORING_EXAMPLES } from "@/config/scoring";


export function PointSystem() {
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
            Tournament Point System
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 580, margin: "0 auto" }}>
            Balanced placement & kill reward matrix — rewards survival without letting camping beat skilled fighting.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32, alignItems: "start" }}>
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
                {PLACEMENT_RULES.map(({ place, points, highlight }) => (
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

          {/* Kill Points & Scoring Balance Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Kill Points Card */}
            <div className="glass-card" style={{ padding: "36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(229,9,20,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Swords size={20} color="#e50914" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 800, color: "#111" }}>
                    Kill Points
                  </h3>
                  <span style={{ fontSize: 13, color: "#666" }}>💀 1 Kill = {KILL_POINT_VALUE} Point</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #eaeaea", borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#111", fontFamily: "Space Grotesk, sans-serif", marginBottom: 4 }}>
                  Why This System is Balanced
                </div>
                <ul style={{ fontSize: 13, color: "#555", lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                  <li>Teams can't win by hiding all game.</li>
                  <li>Aggressive squads are heavily rewarded for kills.</li>
                  <li>Booyah (1st place) still holds high strategic value.</li>
                </ul>
              </div>

              {/* Example Match Breakdown */}
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Flame size={16} color="#e50914" /> Example Match Breakdown
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1.5px solid #eaeaea", textAlign: "left" }}>
                        <th style={{ padding: "8px 10px", color: "#888", fontSize: 11 }}>TEAM</th>
                        <th style={{ padding: "8px 10px", color: "#888", fontSize: 11 }}>PLACEMENT</th>
                        <th style={{ padding: "8px 10px", color: "#888", fontSize: 11 }}>KILLS</th>
                        <th style={{ padding: "8px 10px", textAlign: "right", color: "#888", fontSize: 11 }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCORING_EXAMPLES.map((ex) => (
                        <tr key={ex.team} style={{ borderBottom: "1px solid #f2f2f2" }}>
                          <td style={{ padding: "10px 10px", fontWeight: ex.highlight ? 800 : 700, color: "#111" }}>{ex.team}</td>
                          <td style={{ padding: "10px 10px", color: "#555" }}>{ex.placement} ({ex.placementPts} pts)</td>
                          <td style={{ padding: "10px 10px", color: "#555" }}>{ex.kills} kills</td>
                          <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 800, color: ex.highlight ? "#e50914" : "#111" }}>
                            {ex.total} PTS
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* League Format Card */}
            <div className="glass-card" style={{ padding: "36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={20} color="#10b981" />
                </div>
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 800, color: "#111" }}>
                  Squad Tournament Format
                </h3>
              </div>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 16 }}>
                24 teams compete in group qualifiers and round-robin matches. Accumulated points (placement + kills) from all matches determine live leaderboard standings.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.08)", padding: "10px 16px", borderRadius: 12 }}>
                <Zap size={16} /> Every Fight Remains Meaningful Until The Final Zone
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PointSystem;
