"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Calendar, Clock, Swords, Shield, Eye, Flame, Map } from "lucide-react";

interface Match {
  id: string;
  date: string;
  time: string;
  match: string;
  status: "upcoming" | "live" | "completed";
  stage: string;
  teams?: { t1: string; t2: string };
  streamUrl?: string;
}

const DEMO_MATCHES: Match[] = [
  {
    id: "1",
    date: "TBD",
    time: "7:00 PM",
    match: "Qualifier Match 1 — Bermuda",
    status: "upcoming",
    stage: "Stage 1",
    teams: { t1: "SQUAD 01", t2: "SQUAD 12" }
  },
  {
    id: "2",
    date: "TBD",
    time: "8:00 PM",
    match: "Qualifier Match 2 — Bermuda",
    status: "upcoming",
    stage: "Stage 1",
    teams: { t1: "SQUAD 13", t2: "SQUAD 24" }
  },
  {
    id: "3",
    date: "TBD",
    time: "7:00 PM",
    match: "CS League — Round Robin",
    status: "upcoming",
    stage: "League Stage",
    teams: { t1: "TOP 12 SEEDS", t2: "LEAGUE ROUNDS" }
  },
  {
    id: "4",
    date: "TBD",
    time: "8:00 PM",
    match: "Semi Finals Knockouts",
    status: "upcoming",
    stage: "Semi Finals",
    teams: { t1: "SEMI FINALIST A", t2: "SEMI FINALIST B" }
  },
  {
    id: "5",
    date: "TBD",
    time: "7:30 PM",
    match: "Grand Finals Showdown",
    status: "upcoming",
    stage: "Grand Finals",
    teams: { t1: "FINALIST 1", t2: "FINALIST 2" }
  },
];

const STATUS_STYLES = {
  live: {
    bg: "rgba(229,9,20,0.06)",
    color: "#e50914",
    border: "rgba(229,9,20,0.18)",
    label: "LIVE MATCH",
    glow: "rgba(229,9,20,0.4)"
  },
  upcoming: {
    bg: "rgba(17,17,17,0.03)",
    color: "#444",
    border: "rgba(17,17,17,0.06)",
    label: "SCHEDULED",
    glow: "transparent"
  },
  completed: {
    bg: "rgba(34,197,94,0.06)",
    color: "#16a34a",
    border: "rgba(34,197,94,0.15)",
    label: "COMPLETED",
    glow: "transparent"
  },
};

export function MatchSchedule() {
  const [matches, setMatches] = useState<Match[]>(DEMO_MATCHES);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "live" | "completed">("all");

  useEffect(() => {
    try {
      const q = query(collection(db, "schedule"), orderBy("date"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match)));
        }
      });
      return () => unsub();
    } catch {
      // Use demo data
    }
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (activeFilter === "all") return true;
    return m.status === activeFilter;
  });

  return (
    <section style={{ padding: "120px 0", background: "#fff", position: "relative" }}>
      <div className="container-custom">
        {/* Section Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 32, marginBottom: 64 }}>
          <div>
            <p className="section-tag" style={{ marginBottom: 12 }}>Schedule</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(36px, 4vw, 56px)",
                fontWeight: 800,
                color: "#111",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Match Schedule
            </h2>
            <p style={{ fontSize: 16, color: "#666" }}>Follow match brackets and streams in realtime.</p>
          </div>

          {/* Interactive Filters */}
          <div style={{
            display: "flex",
            background: "#fafafa",
            border: "1px solid #eaeaea",
            borderRadius: 14,
            padding: 4,
            gap: 2,
          }}>
            {(["all", "live", "upcoming", "completed"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  cursor: "pointer",
                  border: "none",
                  background: activeFilter === filter ? "#111" : "transparent",
                  color: activeFilter === filter ? "#fff" : "#666",
                  transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                {filter === "live" ? "🔴 Live" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        {filteredMatches.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 0",
            border: "2px dashed #eaeaea",
            borderRadius: 22,
            background: "#fafafa",
          }}>
            <Calendar size={36} style={{ color: "#bbb", marginBottom: 16 }} />
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 6 }}>
              No Matches Found
            </h3>
            <p style={{ fontSize: 14, color: "#999" }}>
              No matches match the selected filter status. Check back later!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            {filteredMatches.map((match) => {
              const s = STATUS_STYLES[match.status];
              const isLive = match.status === "live";

              return (
                <div
                  key={match.id}
                  className="glass-card"
                  style={{
                    padding: "32px 36px",
                    border: isLive ? "1px solid rgba(229,9,20,0.3)" : "1px solid #eaeaea",
                    background: isLive ? "rgba(229,9,20,0.01)" : "rgba(255,255,255,0.75)",
                    position: "relative",
                    borderRadius: 22,
                    boxShadow: isLive ? "0 12px 32px rgba(229,9,20,0.06)" : "0 4px 16px rgba(0,0,0,0.02)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 24,
                  }}>
                    {/* Stage & Details */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: isLive ? "#e50914" : "#111",
                          background: isLive ? "rgba(229,9,20,0.08)" : "#f0f0f0",
                          padding: "3px 10px",
                          borderRadius: 6,
                        }}>
                          {match.stage}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#999", fontSize: 12 }}>
                          <Calendar size={13} />
                          <span>{match.date}</span>
                          <span style={{ color: "#ddd" }}>|</span>
                          <Clock size={13} />
                          <span>{match.time}</span>
                        </div>
                      </div>

                      <h3 style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111",
                        letterSpacing: "-0.01em",
                      }}>
                        {match.match}
                      </h3>
                    </div>

                    {/* VCT Vs Card Matchup */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      background: "#fafafa",
                      border: "1px solid #eaeaea",
                      padding: "12px 24px",
                      borderRadius: 16,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111", fontFamily: "Space Grotesk, sans-serif" }}>
                        {match.teams?.t1 || "TBD SQUAD"}
                      </span>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: isLive ? "#e50914" : "#111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#fff",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}>
                        VS
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111", fontFamily: "Space Grotesk, sans-serif" }}>
                        {match.teams?.t2 || "TBD SQUAD"}
                      </span>
                    </div>

                    {/* Action & Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div
                        style={{
                          padding: "6px 14px",
                          borderRadius: 100,
                          background: s.bg,
                          color: s.color,
                          border: `1px solid ${s.border}`,
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          animation: isLive ? "pulse-badge 2s infinite" : "none",
                        }}
                      >
                        {isLive && <Flame size={12} />}
                        <span>{s.label}</span>
                      </div>

                      {isLive && (
                        <a
                          href={match.streamUrl || "https://youtube.com"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-accent"
                          style={{
                            padding: "10px 18px",
                            fontSize: 12,
                            borderRadius: 10,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Eye size={14} />
                          <span>Watch Live</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
