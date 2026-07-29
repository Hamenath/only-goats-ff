import type { Metadata } from "next";
import { MatchSchedule } from "@/components/home/MatchSchedule";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Match schedule for Only Goats FF. See all upcoming, live, and completed matches.",
};

export default function SchedulePage() {
  return (
    <div style={{ paddingTop: 80 }}>
      <section className="gradient-mesh" style={{ padding: "80px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>📅 Match Schedule</span>
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
            Schedule
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            All matches, dates, and times. Updated in real-time.
          </p>
        </div>
      </section>
      <MatchSchedule />
    </div>
  );
}
