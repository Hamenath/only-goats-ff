"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAppStore } from "@/store/useAppStore";

export function LoadingScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const setLoading = useAppStore((s) => s.setLoading);

  useEffect(() => {
    const el = ref.current;
    const logo = logoRef.current;
    const bar = barRef.current;
    if (!el || !logo || !bar) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setLoading(false);
        gsap.to(el, {
          y: "-100%",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => setVisible(false),
        });
      },
    });

    tl.fromTo(logo, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
      .to(bar, { width: "100%", duration: 1.0, ease: "power2.inOut" }, 0.3)
      .to(logo, { y: -20, opacity: 0, duration: 0.4, ease: "power2.in" }, 1.5);
  }, [setLoading]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="loading-screen"
      style={{ flexDirection: "column", gap: 32 }}
      aria-hidden="true"
    >
      <div ref={logoRef} style={{ textAlign: "center", opacity: 0 }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: "#e50914",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk, sans-serif" }}>OG</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
          Loading Tournament
        </p>
      </div>
      <div style={{ width: 200, height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1, overflow: "hidden" }}>
        <div
          ref={barRef}
          style={{ height: "100%", width: 0, background: "#e50914", borderRadius: 1 }}
        />
      </div>
    </div>
  );
}
