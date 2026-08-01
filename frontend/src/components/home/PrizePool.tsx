"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useInView } from "react-intersection-observer";

export function PrizePool() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!inView || !cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
    );
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
        <div style={{ textAlign: "center", marginBottom: 60 }}>
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
            Prove your skill and take home the prize. ₹1000 Total Prize Pool.
          </p>
        </div>

        <div ref={ref}>
          {/* Centered Champion Card */}
          <div
            ref={cardRef}
            style={{
              maxWidth: 480,
              margin: "0 auto",
              opacity: 0,
              width: "100%",
            }}
          >
            <div
              style={{
                borderRadius: 28,
                padding: "56px 48px",
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                boxShadow: "0 20px 60px rgba(255,200,0,0.25)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px) scale(1.01)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)"; }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <Image
                  src="/trophy-cup.png"
                  alt="Gold Trophy Cup"
                  width={110}
                  height={110}
                  style={{ objectFit: "contain", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))", width: "auto", height: "auto" }}
                  priority
                />
              </div>
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
                Champion (1st Place)
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
              <p style={{ fontSize: 15, color: "rgba(0,0,0,0.7)", marginTop: 14, fontWeight: 600 }}>
                1st Place Winner • Paid via UPI
              </p>
            </div>
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

export default PrizePool;
