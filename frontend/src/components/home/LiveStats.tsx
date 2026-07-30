"use client";

import { useRef } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Trophy, Zap, RefreshCw, Map, Users, Activity } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function LiveStats() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const { registrationCount, settings } = useAppStore();

  const prizeValue = typeof settings.prizePool === "number" ? settings.prizePool : 1000;
  const entryValue = typeof settings.entryFee === "number" ? settings.entryFee : 100;
  const reEntryValue = typeof settings.reEntry === "number" ? settings.reEntry : 40;

  const STATS = [
    { icon: Trophy, label: "Grand Prize Pool", value: prizeValue, prefix: "₹", color: "#e50914", description: "Winner Takes Home" },
    { icon: Zap, label: "Entry Fee", value: entryValue, prefix: "₹", color: "#111", description: "Per Team" },
    { icon: RefreshCw, label: "Re-Entry Fee", value: reEntryValue, prefix: "₹", color: "#111", description: "Second Chance" },
    { icon: Map, label: "Maps", value: 2, prefix: "", color: "#111", description: "Bermuda Qualifiers" },
    { icon: Users, label: "League Teams", value: 16, prefix: "", color: "#111", description: "Clash Squad League" },
  ];

  return (
    <section style={{ padding: "100px 0", background: "#fafafa", borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea" }}>
      <div className="container-custom">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="section-tag" style={{ marginBottom: 12 }}>Live Statistics</p>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: "#111", letterSpacing: "-0.03em" }}>
            By the Numbers
          </h2>
        </div>

        <div ref={ref}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 2,
              background: "#eaeaea",
              borderRadius: 22,
              overflow: "hidden",
              border: "1px solid #eaeaea",
            }}
          >
            {STATS.map(({ icon: Icon, label, value, prefix, color, description }) => (
              <div
                key={label}
                style={{ background: "#fff", padding: "40px 32px", position: "relative", transition: "all 0.2s ease", cursor: "default" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafafa"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: color === "#e50914" ? "rgba(229,9,20,0.08)" : "rgba(17,17,17,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(36px, 3vw, 48px)", fontWeight: 800, color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8 }}>
                  {prefix}{inView ? <CountUp end={value} duration={2} separator="," /> : 0}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{description}</div>
              </div>
            ))}

            {/* Live Registration Count */}
            <div style={{ background: "#fff", padding: "40px 32px", position: "relative" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafafa"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(229,9,20,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, position: "relative" }}>
                <Activity size={18} style={{ color: "#e50914" }} />
                <span style={{ position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: "50%", background: "#e50914", animation: "pulse-badge 1.5s infinite" }} />
              </div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(36px, 3vw, 48px)", fontWeight: 800, color: "#e50914", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8 }}>
                {registrationCount}<span style={{ fontSize: 20, color: "#ccc" }}>/{settings.registrationLimit || 24}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>Teams Registered</div>
              <div style={{ fontSize: 12, color: "#999" }}>Live Registration</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
