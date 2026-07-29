"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Trophy, Medal, Star, Zap } from "lucide-react";
import gsap from "gsap";
import { useInView } from "react-intersection-observer";

const PRIZES = [
  {
    rank: 1,
    title: "Champion",
    icon: Trophy,
    amount: "₹1000",
    description: "Winner takes all",
    badge: "🥇",
    gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    shadow: "0 20px 60px rgba(255,200,0,0.25)",
    size: "large",
  },
  {
    rank: 2,
    title: "Runner-up",
    icon: Medal,
    amount: "Coming Soon",
    description: "Future update",
    badge: "🥈",
    gradient: "linear-gradient(135deg, #E8E8E8 0%, #B0B0B0 100%)",
    shadow: "0 16px 40px rgba(150,150,150,0.2)",
    size: "medium",
  },
  {
    rank: 3,
    title: "MVP",
    icon: Star,
    amount: "Coming Soon",
    description: "Best overall player",
    badge: "⭐",
    gradient: "linear-gradient(135deg, #FFB347 0%, #CD7F32 100%)",
    shadow: "0 16px 40px rgba(200,120,50,0.2)",
    size: "medium",
  },
  {
    rank: 4,
    title: "Most Kills",
    icon: Zap,
    amount: "Coming Soon",
    description: "Highest kill count",
    badge: "💀",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #e50914 100%)",
    shadow: "0 16px 40px rgba(229,9,20,0.2)",
    size: "medium",
  },
];

export function PrizePool() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!inView) return;
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: i * 0.1, ease: "power3.out" }
      );
    });
  }, [inView]);

  return (
    <section
      style={{
        padding: "120px 0",
        background: "#fafafa",
        borderTop: "1px solid #eaeaea",
        borderBottom: "1px solid #eaeaea",
      }}
    >
      <div className="container-custom">
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <p className="section-tag" style={{ marginBottom: 12 }}>Rewards</p>
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
            Prize Pool
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            Prove your skill and take home the prize. More prizes will be added as registration grows.
          </p>
        </div>

        <div ref={ref}>
          {/* Champion Card */}
          <div
            ref={(el) => { cardsRef.current[0] = el; }}
            style={{
              maxWidth: 480,
              margin: "0 auto 24px",
              opacity: 0,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                padding: "56px 48px",
                background: PRIZES[0].gradient,
                boxShadow: PRIZES[0].shadow,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px) scale(1.01)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)"; }}
            >
              <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>🏆</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.6)",
                  marginBottom: 8,
                }}
              >
                Champion
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "clamp(56px, 8vw, 80px)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  textShadow: "0 2px 16px rgba(0,0,0,0.2)",
                }}
              >
                ₹1000
              </div>
              <p style={{ fontSize: 14, color: "rgba(0,0,0,0.6)", marginTop: 12, fontWeight: 500 }}>
                Winner takes all · Paid via UPI
              </p>
            </div>
          </div>

          {/* Other prizes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {PRIZES.slice(1).map((prize, i) => (
              <div
                key={prize.rank}
                ref={(el) => { cardsRef.current[i + 1] = el; }}
                style={{ opacity: 0 }}
              >
                <div
                  className="glass-card glass-card-hover"
                  style={{
                    padding: "32px 24px",
                    textAlign: "center",
                    border: "1px solid #eaeaea",
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{prize.badge}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                    {prize.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#ccc",
                      letterSpacing: "-0.02em",
                      marginBottom: 8,
                    }}
                  >
                    {prize.amount}
                  </div>
                  <p style={{ fontSize: 12, color: "#bbb" }}>{prize.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/register" className="btn-accent" style={{ fontSize: 16, padding: "16px 36px" }}>
            Compete for the Prize
          </Link>
        </div>
      </div>
    </section>
  );
}
