"use client";

import Link from "next/link";
import Logo from "../ui/Logo";

function DiscordIcon({ size = 18, color = "#5865F2" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18, color = "#E1306C" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 18, color = "#25D366" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.047 0C5.405 0 .002 5.403.002 12.046c0 2.12.554 4.19 1.608 6.014L0 24l6.104-1.602a11.84 11.84 0 005.937 1.588h.005c6.64 0 12.043-5.403 12.044-12.047.001-3.217-1.254-6.242-3.529-8.514"/>
    </svg>
  );
}

const QUICK_LINKS = [
  { href: "/tournament", label: "Tournament" },
  { href: "/rules", label: "Rules" },
  { href: "/schedule", label: "Schedule" },
  { href: "/prize-pool", label: "Prize Pool" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/register", label: "Register" },
];

const SOCIAL = [
  { href: "https://discord.gg/pPTSdw8JW", label: "Discord", color: "#5865F2", icon: DiscordIcon },
  { href: "https://www.instagram.com/only_goats_esp/", label: "Instagram", color: "#E1306C", icon: InstagramIcon },
  { href: "https://chat.whatsapp.com/FeeiKNO0jeBCa0LKOa8iMZ?s=sh&p=a&mlu=4&amv=2", label: "WhatsApp", color: "#25D366", icon: WhatsAppIcon },
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
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              {SOCIAL.map(({ href, label, color, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "1px solid #eaeaea",
                    background: "#fff",
                    color: "#111",
                    fontSize: 13,
                    fontWeight: 700,
                    transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = color;
                    el.style.transform = "translateY(-2px)";
                    el.style.boxShadow = `0 6px 16px ${color}22`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = "#eaeaea";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                  }}
                >
                  <Icon size={18} color={color} />
                  <span>{label}</span>
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

          {/* Tournament Specs */}
          <div>
            <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
              Tournament Specs
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Free Fire Clash Squad", "₹1000 Prize Pool", "24 Squads", "Live Streamed", "UPI Instant Payout"].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "#666" }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #eaeaea", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#999" }}>
            © {new Date().getFullYear()} Only Goats FF. All rights reserved. <span style={{ color: "#666" }}>• Developed by <strong style={{ color: "#111" }}>EDITOR AK</strong> , <strong style={{ color: "#111" }}>VPK</strong> , <strong style={{ color: "#111" }}>KRISH JR</strong></span>
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

export default Footer;
