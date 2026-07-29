"use client";

export function PointSystem() {
  const placements = [
    { place: "1st", points: 12 },
    { place: "2nd", points: 10 },
    { place: "3rd", points: 8 },
    { place: "4th", points: 6 },
    { place: "5th", points: 5 },
    { place: "6th", points: 4 },
    { place: "7th", points: 3 },
    { place: "8th", points: 2 },
    { place: "9th–12th", points: 1 },
    { place: "13th+", points: 0 },
  ];

  const killPoints = [
    { rule: "Each Kill", points: 1 },
    { rule: "Headshot Bonus", points: 0 },
  ];

  const tiebreakers = [
    "Total kills across all matches",
    "Higher placement in most recent match",
    "Total headshots",
    "Team with more Booyahs",
  ];

  return (
    <section style={{ padding: "120px 0", background: "#fafafa", borderTop: "1px solid #eaeaea" }}>
      <div className="container-custom">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p className="section-tag" style={{ marginBottom: 12 }}>Scoring</p>
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
          <p style={{ fontSize: 16, color: "#666" }}>
            Understand how rankings are calculated across all stages.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {/* Placement Points */}
          <div className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 24, color: "#111" }}>
              Placement Points
            </h3>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Placement</th>
                  <th style={{ textAlign: "right" }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {placements.map(({ place, points }) => (
                  <tr key={place}>
                    <td style={{ fontWeight: 600, fontSize: 14 }}>{place}</td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 800,
                          fontSize: 15,
                          color: points >= 8 ? "#e50914" : points >= 4 ? "#111" : "#999",
                        }}
                      >
                        {points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kill Points + CS League + Tiebreakers */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Kill Points */}
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 24, color: "#111" }}>
                Kill Points
              </h3>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Rule</th>
                    <th style={{ textAlign: "right" }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {killPoints.map(({ rule, points }) => (
                    <tr key={rule}>
                      <td style={{ fontWeight: 500, fontSize: 14 }}>{rule}</td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: 15, color: "#e50914" }}>
                          +{points === 0 ? "1" : points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CS League */}
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#111" }}>
                CS League Format
              </h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
                16 teams compete in a round-robin league. Points accumulate from all matches. Top 4 advance to semifinals using the same placement + kill system.
              </p>
            </div>

            {/* Tiebreakers */}
            <div className="glass-card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#111" }}>
                Tiebreakers
              </h3>
              <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {tiebreakers.map((tb, i) => (
                  <li key={i} style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
                    {tb}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
