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
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3");


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
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <source src="/hero-background-video.mp4" type="video/mp4" />
      </video>

      {/* Dimming Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(11, 11, 11, 0.78)", // Dark dimmed overlay
          backdropFilter: "blur(2px)", // Subtle premium blur
          zIndex: 0,
          pointerEvents: "none",
        }}
      />


      <div className="container-custom" style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center", textAlign: "center" }}>
        <div style={{ maxWidth: 800, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Badge */}
          <div ref={badgeRef} style={{ opacity: 0, marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <span className="badge badge-accent">
              <span>🔥</span>
              <span>Free Fire Tournament</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e50914", display: "inline-block", animation: "pulse-badge 1.5s infinite" }} />
              <span>Live Registration</span>
            </span>
          </div>

          {/* Heading */}
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px 16px", marginBottom: 24, alignItems: "baseline", justifyContent: "center" }}>
            <div style={{ overflow: "hidden" }}>
              <div ref={heading1Ref} className="hero-heading" style={{ opacity: 0, color: "#fff", fontSize: "clamp(28px, 3.8vw, 48px)" }}>BATTLE.</div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div ref={heading2Ref} className="hero-heading" style={{ opacity: 0, color: "#fff", fontSize: "clamp(28px, 3.8vw, 48px)" }}>SURVIVE.</div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div ref={heading3Ref} className="hero-heading" style={{ opacity: 0, color: "transparent", WebkitTextStroke: "2px #fff", fontSize: "clamp(28px, 3.8vw, 48px)" }}>
                CHAMPION.
              </div>
            </div>
          </div>

          {/* Subheading */}
          <p ref={subRef} style={{ opacity: 0, fontSize: "clamp(15px, 1.8vw, 18px)", color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.6, maxWidth: 520, marginBottom: 36, margin: "0 auto 36px", textAlign: "center" }}>
            Compete against the best squads. Register your team now. Win cash prizes and become the champion of Only Goats FF.
          </p>

          {/* Countdown */}
          <div ref={countdownRef} style={{ opacity: 0, marginBottom: 36, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.5)", marginBottom: 12 }}>
              Tournament Starts In
            </p>
            <CountdownTimer className="dark-hero-timer" />
          </div>

          {/* Registration Stats */}
          <div ref={statsRef} style={{ opacity: 0, marginBottom: 36, maxWidth: 440, width: "100%", margin: "0 auto 36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={16} style={{ color: "rgba(255, 255, 255, 0.7)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Registered Teams</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "Space Grotesk, sans-serif", color: isFull ? "#e50914" : "#fff" }}>
                {registrationCount} / {settings.registrationLimit}
              </span>
            </div>
            <div className="progress-bar-bg" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}>
              <div className={`progress-bar-fill${isFull ? " full" : ""}`} style={{ width: `${progress}%` }} />
            </div>
            {isFull && <p style={{ fontSize: 12, color: "#e50914", fontWeight: 600, marginTop: 8 }}>Registration is closed — all slots filled!</p>}
          </div>

          {/* CTAs */}
          <div ref={ctaRef} style={{ opacity: 0, display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48, justifyContent: "center" }}>
            {settings.registrationEnabled && !isFull ? (
              <Link href="/register" className="btn-liquid-glass-accent">
                Register Team <ArrowRight size={18} />
              </Link>
            ) : (
              <button disabled className="btn-liquid-glass-accent" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                Registration Closed
              </button>
            )}
            <Link href="/rules" className="btn-liquid-glass-ghost">
              <Shield size={18} /> Tournament Rules
            </Link>
          </div>

          {/* Mini features */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: Zap, label: "₹1000 Prize Pool" },
              { icon: Shield, label: "Fair Play Guaranteed" },
              { icon: Users, label: "24 Teams Max" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} style={{ color: "#e50914" }} />
                </div>
                <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
