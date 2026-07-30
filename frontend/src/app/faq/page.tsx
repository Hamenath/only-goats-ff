import type { Metadata } from "next";
import { FAQContent } from "@/components/faq/FAQContent";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Only Goats FF Tournament. Registration, payment, rules, and more.",
};

export default function FAQPage() {
  return (
    <div>
      <section className="gradient-mesh" style={{ padding: "140px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>❓ FAQ</span>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: "#111", letterSpacing: "-0.04em", marginBottom: 20 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            Everything you need to know before joining.
          </p>
        </div>
      </section>
      <section style={{ padding: "60px 0 120px" }}>
        <div className="container-custom" style={{ maxWidth: 760 }}>
          <FAQContent />
        </div>
      </section>
    </div>
  );
}
