import type { Metadata } from "next";
import { PrizePool } from "@/components/home/PrizePool";

export const metadata: Metadata = {
  title: "Prize Pool",
  description: "Win ₹1000 and more. Check out the prize breakdown for Only Goats FF Tournament.",
};

export default function PrizePoolPage() {
  return (
    <div>
      <section className="gradient-mesh" style={{ padding: "140px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>🏆 Prizes</span>
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
            Prize Pool
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            Every squad fights for the ultimate reward. Here&apos;s what&apos;s at stake.
          </p>
        </div>
      </section>
      <PrizePool />
    </div>
  );
}
