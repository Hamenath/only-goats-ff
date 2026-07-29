import type { Metadata } from "next";
import { RulesContent } from "@/components/rules/RulesContent";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Official tournament rules for Only Goats FF. Fair play, match regulations, payment, and re-entry rules.",
};

export default function RulesPage() {
  return (
    <div style={{ paddingTop: 80 }}>
      <section className="gradient-mesh" style={{ padding: "80px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>📋 Official Rules</span>
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.04em",
              marginBottom: 20,
            }}
          >
            Tournament Rules
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 540, margin: "0 auto" }}>
            Read and understand all rules before registering. Violation leads to disqualification.
          </p>
        </div>
      </section>
      <section style={{ padding: "80px 0 120px" }}>
        <div className="container-custom" style={{ maxWidth: 900 }}>
          <RulesContent />
        </div>
      </section>
    </div>
  );
}
