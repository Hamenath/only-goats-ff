"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageModal({ src, alt, onClose }: ImageModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: -12, right: -12, zIndex: 10,
            width: 32, height: 32, borderRadius: "50%",
            background: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <X size={16} color="#0F172A" />
        </button>
        <img
          src={src}
          alt={alt || "Preview"}
          style={{
            maxWidth: "85vw", maxHeight: "85vh",
            borderRadius: 12, objectFit: "contain",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        />
      </div>
    </div>
  );
}
