import type { Metadata } from "next";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Live leaderboard for Only Goats FF Tournament. See top teams by kills, points, and wins.",
};

export default function LeaderboardPage() {
  return (
    <div>
      <section className="gradient-mesh" style={{ padding: "140px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-live" style={{ marginBottom: 24 }}>
            🔴 Live Standings
          </span>
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
            Leaderboard
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            Updated in real-time. Rankings determined by total points — placement + kills.
          </p>
        </div>
      </section>
      <section style={{ padding: "60px 0 120px" }}>
        <div className="container-custom">
          <LeaderboardTable />
        </div>
      </section>
    </div>
  );
}
