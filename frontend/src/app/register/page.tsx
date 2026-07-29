import type { Metadata } from "next";
import { RegisterForm } from "@/components/register/RegisterForm";
import { Shield, Clock, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register your squad for Only Goats FF Tournament. Entry fee ₹100. Compete for ₹1000 prize pool.",
};

export default function RegisterPage() {
  return (
    <div style={{ paddingTop: 80 }}>
      <section className="gradient-mesh" style={{ padding: "80px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>✍️ Registration Open</span>
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.04em",
              marginBottom: 20,
            }}
          >
            Register Your Squad
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            Fill in your team details, upload payment proof, and you&apos;re in.
          </p>
        </div>
      </section>

      <section style={{ padding: "60px 0 120px" }}>
        <div className="container-custom">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>
            {/* Form */}
            <div className="glass-card" style={{ padding: "48px 48px" }}>
              <RegisterForm />
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  icon: CreditCard,
                  title: "Entry Fee",
                  desc: "₹100 per squad. Re-entry available at ₹40.",
                  color: "#e50914",
                },
                {
                  icon: Clock,
                  title: "Confirmation",
                  desc: "Your registration will be confirmed via WhatsApp within 24 hours.",
                  color: "#111",
                },
                {
                  icon: Shield,
                  title: "Fair Play",
                  desc: "All players are verified. Cheating results in immediate disqualification.",
                  color: "#111",
                },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="glass-card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: color === "#e50914" ? "rgba(229,9,20,0.08)" : "rgba(17,17,17,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{title}</h4>
                      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .register-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
