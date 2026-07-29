import type { Metadata } from "next";
import { MessageCircle, Mail, Send, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Only Goats FF. Discord, Instagram, WhatsApp, and Email.",
};

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

const SOCIALS = [
  { name: "Discord", handle: "Join our server", icon: Send, href: "https://discord.gg/your-invite", color: "#5865F2", bg: "rgba(88,101,242,0.08)", border: "rgba(88,101,242,0.15)", desc: "Join 500+ members in our community server. Get match updates and announcements." },
  { name: "Instagram", handle: "@onlygoats.ff", icon: InstagramIcon, href: "https://instagram.com/onlygoats.ff", color: "#E1306C", bg: "rgba(225,48,108,0.08)", border: "rgba(225,48,108,0.15)", desc: "Follow for highlights, match clips, and tournament updates." },
  { name: "WhatsApp", handle: "Join Tournament Group", icon: MessageCircle, href: "https://chat.whatsapp.com/FeeiKNO0jeBCa0LKOa8iMZ?s=sh&p=a&mlu=4&amv=2", color: "#25D366", bg: "rgba(37,211,102,0.08)", border: "rgba(37,211,102,0.15)", desc: "Get room IDs, match times, and direct support via WhatsApp." },
  { name: "Email", handle: "contact@onlygoats-ff.com", icon: Mail, href: "mailto:contact@onlygoats-ff.com", color: "#e50914", bg: "rgba(229,9,20,0.08)", border: "rgba(229,9,20,0.15)", desc: "For formal queries, sponsorships, and business inquiries." },
];

export default function ContactPage() {
  return (
    <div style={{ paddingTop: 80 }}>
      <section className="gradient-mesh" style={{ padding: "80px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>📬 Contact Us</span>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: "#111", letterSpacing: "-0.04em", marginBottom: 20 }}>
            Get in Touch
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            Questions? Feedback? Reach us on any platform below.
          </p>
        </div>
      </section>

      <section style={{ padding: "60px 0 120px" }}>
        <div className="container-custom">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
            {SOCIALS.map(({ name, handle, icon: Icon, href, color, bg, border, desc }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="glass-card glass-card-hover"
                  style={{
                    padding: "36px 28px",
                    height: "100%",
                    background: bg,
                    border: `1px solid ${border}`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={24} color="#fff" />
                    </div>
                    <ExternalLink size={16} style={{ color, marginTop: 4 }} />
                  </div>
                  <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 4 }}>
                    {name}
                  </h3>
                  <p style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 12 }}>{handle}</p>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
