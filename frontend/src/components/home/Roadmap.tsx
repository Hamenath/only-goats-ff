"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import gsap from "gsap";
import { ChevronRight, Calendar, Users, Award, ShieldAlert, Zap, Trophy, Play } from "lucide-react";

interface Stage {
  id: number;
  title: string;
  desc: string;
  meta: string;
  accent: boolean;
  details: string[];
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: "Stage 1 — Open Qualifiers",
    desc: "24 teams battle across 2 Bermuda matches.",
    meta: "24 Teams · 2 Maps",
    accent: true,
    details: [
      "24 registered squads will be split into groups.",
      "Top 12 teams based on cumulative placement & kill points advance.",
      "Room details shared 15 minutes before the start time."
    ],
    icon: Play
  },
  {
    id: 2,
    title: "Top 12 Advance",
    desc: "Top 12 teams based on total points qualify for CS League.",
    meta: "Points-based cut",
    accent: false,
    details: [
      "Strict point verification based on official placement matrix.",
      "Kill validation via room records and spectator feeds.",
      "Final standings will be posted on the live leaderboard."
    ],
    icon: Users
  },
  {
    id: 3,
    title: "Re-Entry Available",
    desc: "Eliminated teams can re-enter for ₹40.",
    meta: "Second Chance Stage",
    accent: false,
    details: [
      "Teams ranking 13th to 24th can request re-entry.",
      "Re-entry fee of ₹40 paid via UPI.",
      "Ensures extra playtime and a path back to the tournament."
    ],
    icon: Zap
  },
  {
    id: 4,
    title: "16 Team CS League",
    desc: "16 teams compete in a round-robin style league format.",
    meta: "League Stage",
    accent: true,
    details: [
      "Clash Squad custom rooms.",
      "Accumulated point systems active.",
      "Top 4 teams move directly into the knockout finals."
    ],
    icon: Calendar
  },
  {
    id: 5,
    title: "Top 4 Semi Finals",
    desc: "Top 4 teams from the league advance to semi-finals.",
    meta: "Knockout Format",
    accent: false,
    details: [
      "Best of 3 matches.",
      "Loser is eliminated immediately.",
      "Fair play checking is highly monitored."
    ],
    icon: ShieldAlert
  },
  {
    id: 6,
    title: "Grand Finals",
    desc: "The 2 best teams face off in the ultimate battle.",
    meta: "Showdown Match",
    accent: true,
    details: [
      "Best of 5 matches.",
      "Live streamed with delayed cast to prevent stream sniping.",
      "UPI payouts processed live immediately after the champion announcement."
    ],
    icon: Trophy
  },
  {
    id: 7,
    title: "🏆 Champion",
    desc: "One team stands above all. The Only Goat.",
    meta: "₹1000 Prize",
    accent: true,
    details: [
      "Official certificate and 'Only Goat' title awarded.",
      "Direct entry invitation to the next tournament season.",
      "Premium spotlight feature on the home gallery page."
    ],
    icon: Award
  },
];

export function Roadmap() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const stagesRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStage, setActiveStage] = useState<number | null>(1);

  useEffect(() => {
    if (!inView) return;
    stagesRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power3.out",
        }
      );
    });
  }, [inView]);

  return (
    <section style={{ padding: "120px 0", background: "#fff", position: "relative" }}>
      {/* Light decorative gradient */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "30%",
        transform: "translate(-50%, -50%)",
        width: 600,
        height: 600,
        background: "radial-gradient(circle, rgba(229,9,20,0.015) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div className="container-custom" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <p className="section-tag" style={{ marginBottom: 12 }}>How It Works</p>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(36px, 4vw, 56px)",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Tournament Roadmap
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 520, margin: "0 auto" }}>
            Click on any stage card to expand detailed rules and procedures. Follow the road to the top.
          </p>
        </div>

        <div ref={ref} style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
          {/* Vertical Progress Line with glowing accent */}
          <div
            style={{
              position: "absolute",
              left: 27,
              top: 10,
              bottom: 10,
              width: 2,
              background: "linear-gradient(to bottom, #eaeaea, #e50914, #eaeaea)",
              borderRadius: 1,
            }}
          />

          {STAGES.map((stage, i) => {
            const isExpanded = activeStage === stage.id;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                ref={(el) => { stagesRefs.current[i] = el; }}
                style={{
                  display: "flex",
                  gap: 28,
                  marginBottom: 24,
                  opacity: 0,
                  transition: "opacity 0.5s ease",
                }}
              >
                {/* Node Dot Wrapper */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    flexShrink: 0,
                  }}
                >
                  {/* Dynamic glowing dot rings for active state */}
                  {isExpanded && (
                    <div style={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(229,9,20,0.4)",
                      animation: "pulse-badge 2s infinite",
                      transform: "translate(-8px, -8px)",
                    }} />
                  )}

                  <button
                    onClick={() => setActiveStage(isExpanded ? null : stage.id)}
                    aria-label={`Expand details for ${stage.title}`}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: stage.accent ? "#e50914" : "#fff",
                      border: stage.accent ? "none" : "2px solid #eaeaea",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: stage.accent
                        ? "0 8px 24px rgba(229,9,20,0.25)"
                        : "0 4px 12px rgba(0,0,0,0.03)",
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    }}
                  >
                    <Icon
                      size={20}
                      style={{
                        color: stage.accent ? "#fff" : "#666",
                        transform: isExpanded ? "scale(1.15)" : "scale(1)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </button>
                </div>

                {/* Content Card */}
                <div
                  style={{
                    flex: 1,
                    background: isExpanded
                      ? "rgba(255, 255, 255, 1)"
                      : stage.accent
                      ? "rgba(229,9,20,0.02)"
                      : "rgba(250,250,250,0.8)",
                    border: `1px solid ${
                      isExpanded
                        ? "#111"
                        : stage.accent
                        ? "rgba(229,9,20,0.12)"
                        : "#eaeaea"
                    }`,
                    borderRadius: 20,
                    padding: "24px 28px",
                    cursor: "pointer",
                    boxShadow: isExpanded
                      ? "0 20px 48px rgba(0,0,0,0.08)"
                      : "0 2px 8px rgba(0,0,0,0.02)",
                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                  onClick={() => setActiveStage(isExpanded ? null : stage.id)}
                >
                  {/* Header info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: 12,
                        fontWeight: 800,
                        color: stage.accent ? "#e50914" : "#999",
                        background: stage.accent ? "rgba(229,9,20,0.08)" : "rgba(0,0,0,0.04)",
                        padding: "2px 8px",
                        borderRadius: 6,
                      }}>
                        STAGE 0{stage.id}
                      </span>
                      <h3
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: 18,
                          fontWeight: 700,
                          color: stage.accent ? "#e50914" : "#111",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {stage.title}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#666",
                        letterSpacing: "0.04em",
                        background: "#fff",
                        border: "1px solid #eaeaea",
                        padding: "4px 10px",
                        borderRadius: 100,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stage.meta}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: isExpanded ? 20 : 0, transition: "margin 0.3s" }}>
                    {stage.desc}
                  </p>

                  {/* Expandable Details Drawer */}
                  <div
                    style={{
                      maxHeight: isExpanded ? 400 : 0,
                      opacity: isExpanded ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s",
                    }}
                  >
                    <div style={{ borderTop: "1px solid #eaeaea", paddingTop: 18, marginTop: 18 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111", marginBottom: 12 }}>
                        Operational Guidelines
                      </h4>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                        {stage.details.map((detail, idx) => (
                          <li key={idx} style={{ display: "flex", gap: 10, fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                            <ChevronRight size={14} style={{ color: "#e50914", flexShrink: 0, marginTop: 3 }} />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
