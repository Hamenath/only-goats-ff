"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PRODUCTION ERROR BOUNDARY]:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#090A0F",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 24,
          padding: "48px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(229, 9, 20, 0.15)",
            border: "1px solid rgba(229, 9, 20, 0.3)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            color: "#E50914",
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h2
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 12,
            letterSpacing: "-0.02em",
          }}
        >
          Service Temporarily Unavailable
        </h2>

        <p
          style={{
            fontSize: 15,
            color: "rgba(255, 255, 255, 0.6)",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          We encountered an unexpected network or service issue. Please try refreshing or clicking the button below.
        </p>

        <button
          onClick={() => reset()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 32px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #E50914 0%, #B20710 100%)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(229, 9, 20, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          <RotateCcw size={18} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
