"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ArrowRight, Shield, Users, Zap } from "lucide-react";
import { CountdownTimer } from "../ui/CountdownTimer";
import { useAppStore } from "@/store/useAppStore";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function HeroSection() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const heading1Ref = useRef<HTMLDivElement>(null);
  const heading2Ref = useRef<HTMLDivElement>(null);
  const heading3Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const shapeRef1 = useRef<HTMLDivElement>(null);
  const shapeRef2 = useRef<HTMLDivElement>(null);
  const shapeRef3 = useRef<HTMLDivElement>(null);

  const { registrationCount, settings, setRegistrationCount, setSettings } = useAppStore();
  const isFull = registrationCount >= settings.registrationLimit;

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, "settings", "tournament"), (snap) => {
        if (snap.exists()) setSettings(snap.data() as Parameters<typeof setSettings>[0]);
      });
      return () => unsub();
    } catch { /* use defaults */ }
  }, [setSettings]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, "settings", "registrationCount"), (snap) => {
        if (snap.exists()) setRegistrationCount(snap.data().count ?? 0);
      });
      return () => unsub();
    } catch { /* use defaults */ }
  }, [setRegistrationCount]);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.2 });

    tl.fromTo(badgeRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
      .fromTo(heading1Ref.current, { y: 40, opacity: 0, skewY: 2 }, { y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
      .fromTo(heading2Ref.current, { y: 40, opacity: 0, skewY: 2 }, { y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .fromTo(heading3Ref.current, { y: 40, opacity: 0, skewY: 2 }, { y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .fromTo(countdownRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .fromTo(statsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .fromTo(imageContainerRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6");

    gsap.to(shapeRef1.current, { y: -24, rotation: 8, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(shapeRef2.current, { y: -16, rotation: -6, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.8 });
    gsap.to(shapeRef3.current, { y: -20, scale: 1.05, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 });
  }, []);

  const progress = Math.min((registrationCount / settings.registrationLimit) * 100, 100);

  // Disabled cursor tilt effect
  const handleMouseMove = () => {};
  const handleMouseLeave = () => {};

  return (
    <section
      className="gradient-mesh noise-texture"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      {/* Background shapes */}
      <div ref={shapeRef1} aria-hidden="true" style={{
        position: "absolute", right: "5%", top: "10%",
        width: 380, height: 380,
        borderRadius: "40% 60% 55% 45% / 45% 40% 60% 55%",
        background: "linear-gradient(135deg, rgba(229,9,20,0.05) 0%, rgba(229,9,20,0.01) 100%)",
        border: "1px solid rgba(229,9,20,0.06)",
        backdropFilter: "blur(40px)",
        pointerEvents: "none",
      }} />
      <div ref={shapeRef2} aria-hidden="true" style={{
        position: "absolute", right: "45%", bottom: "5%",
        width: 180, height: 180,
        borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
        background: "rgba(17,17,17,0.02)",
        border: "1px solid rgba(17,17,17,0.04)",
        pointerEvents: "none",
      }} />
      <div ref={shapeRef3} aria-hidden="true" style={{
        position: "absolute", left: "2%", top: "25%",
        width: 100, height: 100, borderRadius: "50%",
        background: "rgba(229,9,20,0.03)",
        border: "1px solid rgba(229,9,20,0.06)",
        pointerEvents: "none",
      }} />

      <div className="container-custom" style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <div className="hero-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 64,
          alignItems: "center",
        }}>
          {/* Left Column: Hero Content */}
          <div>
            {/* Badge */}
            <div ref={badgeRef} style={{ opacity: 0, marginBottom: 24 }}>
              <span className="badge badge-accent">
                <span>🔥</span>
                <span>Free Fire Tournament</span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e50914", display: "inline-block", animation: "pulse-badge 1.5s infinite" }} />
                <span>Live Registration</span>
              </span>
            </div>

            {/* Heading */}
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px 16px", marginBottom: 24, alignItems: "baseline" }}>
              <div style={{ overflow: "hidden" }}>
                <div ref={heading1Ref} className="hero-heading" style={{ opacity: 0, color: "#111", fontSize: "clamp(28px, 3.8vw, 48px)" }}>BATTLE.</div>
              </div>
              <div style={{ overflow: "hidden" }}>
                <div ref={heading2Ref} className="hero-heading" style={{ opacity: 0, color: "#111", fontSize: "clamp(28px, 3.8vw, 48px)" }}>SURVIVE.</div>
              </div>
              <div style={{ overflow: "hidden" }}>
                <div ref={heading3Ref} className="hero-heading" style={{ opacity: 0, color: "transparent", WebkitTextStroke: "2px #111", fontSize: "clamp(28px, 3.8vw, 48px)" }}>
                  CHAMPION.
                </div>
              </div>
            </div>

            {/* Subheading */}
            <p ref={subRef} style={{ opacity: 0, fontSize: "clamp(15px, 1.8vw, 18px)", color: "#666", lineHeight: 1.6, maxWidth: 520, marginBottom: 36 }}>
              Compete against the best squads. Register your team now. Win cash prizes and become the champion of Only Goats FF.
            </p>

            {/* Countdown */}
            <div ref={countdownRef} style={{ opacity: 0, marginBottom: 36 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: 12 }}>
                Tournament Starts In
              </p>
              <CountdownTimer />
            </div>

            {/* Registration Stats */}
            <div ref={statsRef} style={{ opacity: 0, marginBottom: 36, maxWidth: 440 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={16} style={{ color: "#666" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>Registered Teams</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "Space Grotesk, sans-serif", color: isFull ? "#e50914" : "#111" }}>
                  {registrationCount} / {settings.registrationLimit}
                </span>
              </div>
              <div className="progress-bar-bg">
                <div className={`progress-bar-fill${isFull ? " full" : ""}`} style={{ width: `${progress}%` }} />
              </div>
              {isFull && <p style={{ fontSize: 12, color: "#e50914", fontWeight: 600, marginTop: 8 }}>Registration is closed — all slots filled!</p>}
            </div>

            {/* CTAs */}
            <div ref={ctaRef} style={{ opacity: 0, display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48 }}>
              {settings.registrationEnabled && !isFull ? (
                <Link href="/register" className="btn-accent" style={{ fontSize: 15, padding: "14px 28px" }}>
                  Register Team <ArrowRight size={18} />
                </Link>
              ) : (
                <button disabled className="btn-accent" style={{ fontSize: 15, padding: "14px 28px", opacity: 0.5, cursor: "not-allowed" }}>
                  Registration Closed
                </button>
              )}
              <Link href="/rules" className="btn-ghost" style={{ fontSize: 15, padding: "14px 28px" }}>
                <Shield size={18} /> Tournament Rules
              </Link>
            </div>

            {/* Mini features */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { icon: Zap, label: "₹1000 Prize Pool" },
                { icon: Shield, label: "Fair Play Guaranteed" },
                { icon: Users, label: "24 Teams Max" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(229,9,20,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={14} style={{ color: "#e50914" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Illustration */}
          <div
            className="hero-illustration-wrapper"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="glass-card"
              style={{
                opacity: 0,
                padding: 16,
                borderRadius: 28,
                background: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.05)",
                width: "100%",
                maxWidth: 460,
                aspectRatio: "1/1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "box-shadow 0.3s",
                position: "relative",
                overflow: "visible",
              }}
            >
              {/* Dynamic light accent behind image */}
              <div style={{
                position: "absolute",
                width: "80%",
                height: "80%",
                background: "radial-gradient(circle, rgba(229,9,20,0.15) 0%, transparent 70%)",
                zIndex: 0,
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src="/esports-hero.png"
                  alt="Only Goats Championship Trophy"
                  width={420}
                  height={420}
                  priority
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    borderRadius: 20,
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.2)",
                  }}
                />
              </div>

              {/* Floating badges on illustration card */}
              <div style={{
                position: "absolute",
                top: 24,
                left: -20,
                background: "#111",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 12,
                boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Space Grotesk, sans-serif",
              }}>
                <Zap size={14} color="#e50914" />
                <span>ULTRA LEAGUE</span>
              </div>

              <div style={{
                position: "absolute",
                bottom: 24,
                right: -20,
                background: "#fff",
                color: "#111",
                padding: "8px 16px",
                borderRadius: 12,
                boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Space Grotesk, sans-serif",
                border: "1px solid #eaeaea",
              }}>
                <span>🥇 CHAMPION ACCREDITED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1.15fr 0.85fr !important;
            gap: 40px !important;
          }
          .hero-illustration-wrapper .glass-card {
            max-width: 380px !important;
          }
        }
        @media (min-width: 1280px) {
          .hero-grid {
            grid-template-columns: 7fr 5fr !important;
            gap: 64px !important;
          }
          .hero-illustration-wrapper .glass-card {
            max-width: 420px !important;
          }
        }
        @media (min-width: 1440px) {
          .hero-illustration-wrapper .glass-card {
            max-width: 460px !important;
          }
        }
        @media (max-width: 1023px) {
          .hero-illustration-wrapper {
            margin-top: 24px;
          }
          .hero-illustration-wrapper .glass-card {
            max-width: 360px !important;
          }
        }
      `}</style>
    </section>
  );
}
