"use client";

import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react";
import Logo from "../ui/Logo";

const QUICK_LINKS = [
  { href: "/tournament", label: "Tournament" },
  { href: "/rules", label: "Rules" },
  { href: "/schedule", label: "Schedule" },
  { href: "/prize-pool", label: "Prize Pool" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/register", label: "Register" },
];

const SOCIAL = [
  { href: "https://discord.gg/", label: "Discord", color: "#5865F2" },
  { href: "https://instagram.com/", label: "Instagram", color: "#E1306C" },
  { href: "https://chat.whatsapp.com/FeeiKNO0jeBCa0LKOa8iMZ?s=sh&p=a&mlu=4&amv=2", label: "WhatsApp", color: "#25D366" },
  { href: "mailto:contact@onlygoats-ff.com", label: "Email", color: "#e50914" },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #eaeaea",
        background: "#fafafa",
        padding: "80px 0 40px",
      }}
    >
      <div className="container-custom">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 60,
            marginBottom: 64,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <Logo size={44} showText={true} />
            </div>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, maxWidth: 300 }}>
              The most elite Free Fire tournament. Battle against the best squads, survive, and claim your place as the champion.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {SOCIAL.map(({ href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid #eaeaea",
                    background: "#fff",
                    color: "#666",
                    fontSize: 12,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.color = color;
                    el.style.borderColor = color;
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.color = "#666";
                    el.style.borderColor = "#eaeaea";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{ fontSize: 14, color: "#666", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e50914")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#666")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tournament Info */}
          <div>
            <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
              Tournament
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Prize Pool: ₹1000", "Entry Fee: ₹100", "Re-entry: ₹40", "Teams: 24 squads", "Maps: 2 Bermuda", "Format: League + KO"].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "#666" }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #eaeaea", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#999" }}>
            © {new Date().getFullYear()} Only Goats FF. All rights reserved. <span style={{ color: "#666" }}>• Created by <strong style={{ color: "#111" }}>VPK</strong>, <strong style={{ color: "#111" }}>Krish Jr</strong> & <strong style={{ color: "#111" }}>Editor AK</strong></span>
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <span key={item} style={{ fontSize: 13, color: "#999", cursor: "pointer" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </footer>
  );
}
