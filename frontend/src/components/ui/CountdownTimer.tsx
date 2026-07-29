"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(targetDate: string): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function CountdownTimer({ className = "" }: { className?: string }) {
  const settings = useAppStore((s) => s.settings);
  const timeLeft = useCountdown(settings.tournamentDate);

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`} style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {units.map((unit, i) => (
        <div key={unit.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <span className="countdown-digit">{pad(unit.value)}</span>
            <span className="countdown-label">{unit.label}</span>
          </div>
          {i < units.length - 1 && (
            <span style={{
              fontSize: "clamp(28px,4vw,56px)",
              fontWeight: 800,
              color: "#e50914",
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: 1,
              marginBottom: 18,
            }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function MiniCountdown() {
  const settings = useAppStore((s) => s.settings);
  const timeLeft = useCountdown(settings.tournamentDate);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.06em", textTransform: "uppercase", marginRight: 6 }}>
        Starts in
      </span>
      {[
        { v: timeLeft.days, l: "d" },
        { v: timeLeft.hours, l: "h" },
        { v: timeLeft.minutes, l: "m" },
        { v: timeLeft.seconds, l: "s" },
      ].map(({ v, l }, i) => (
        <span key={l} style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <span style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#111",
            background: "#f0f0f0",
            padding: "2px 6px",
            borderRadius: 6,
            minWidth: 28,
            textAlign: "center",
          }}>
            {pad(v)}
          </span>
          <span style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>{l}</span>
          {i < 3 && <span style={{ color: "#ccc", fontSize: 12, margin: "0 1px" }}>:</span>}
        </span>
      ))}
    </div>
  );
}
