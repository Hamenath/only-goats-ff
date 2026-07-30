import type { Metadata } from "next";
import { Roadmap } from "@/components/home/Roadmap";
import { PointSystem } from "@/components/home/PointSystem";
import { PrizePool } from "@/components/home/PrizePool";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Tournament",
  description:
    "Full tournament details — format, stages, point system, and prize breakdown for Only Goats FF.",
};

export default function TournamentPage() {
  return (
    <div>
      {/* Header */}
      <section className="gradient-mesh" style={{ padding: "140px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>🏆 Tournament Details</span>
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
            The Tournament
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 540, margin: "0 auto 32px" }}>
            Everything you need to know about the format, rules, and how to win.
          </p>
          <Link href="/register" className="btn-accent" style={{ fontSize: 15 }}>
            Register Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Roadmap />
      <PointSystem />
      <PrizePool />
    </div>
  );
}
