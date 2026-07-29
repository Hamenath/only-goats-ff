"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSub?: string;
  className?: string;
  variant?: "light" | "dark";
}

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  showText = false,
  textSub = "Tournament Series",
  className = "",
  variant = "dark",
}) => {
  const textColor = variant === "light" ? "#ffffff" : "#111111";
  const subColor = variant === "light" ? "rgba(255,255,255,0.6)" : "#999999";

  return (
    <Link
      href="/"
      aria-label="Go to Only Goats FF homepage"
      className={`flex items-center gap-3 select-none ${className}`}
      style={{ textDecoration: "none", display: "inline-flex", cursor: "pointer" }}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden transition-transform hover:scale-105"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          background: "transparent",
        }}
      >
        <Image
          src="/logo.jpg"
          alt="Only Goats Emblem Logo"
          width={size}
          height={size}
          className="w-full h-full"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      {showText && (
        <div>
          <div
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: Math.max(14, Math.round(size * 0.42)),
              color: textColor,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Only Goats FF
          </div>
          {textSub && (
            <div
              style={{
                fontSize: Math.max(9, Math.round(size * 0.24)),
                color: subColor,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginTop: 2,
              }}
            >
              {textSub}
            </div>
          )}
        </div>
      )}
    </Link>
  );
};

export default Logo;
