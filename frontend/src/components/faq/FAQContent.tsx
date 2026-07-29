"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "When is the tournament?", a: "The tournament date will be announced on our WhatsApp group and this website. Check the countdown timer on the homepage for the scheduled date." },
  { q: "Who can participate?", a: "Anyone with a valid Free Fire account can participate. All skill levels are welcome. Teams must have 4 main players and can have 1 substitute." },
  { q: "How do I pay the entry fee?", a: "Pay ₹100 via UPI to our UPI ID. After payment, upload the screenshot and enter your transaction ID in the registration form." },
  { q: "When will I get room ID and password?", a: "Room ID and password will be shared on the WhatsApp group 15 minutes before the match starts." },
  { q: "What happens if I miss the match start?", a: "A 5-minute grace period is given. After that, the match proceeds without your team. We recommend joining 10 minutes early." },
  { q: "Can I change my team members after registering?", a: "No, team members cannot be changed after registration is confirmed. Make sure all details are correct." },
  { q: "Is the prize paid immediately after the match?", a: "The prize will be sent via UPI within 24 hours of the tournament ending." },
  { q: "What if I'm having issues with the website?", a: "Contact us on WhatsApp or Discord. Links are on the Contact page." },
  { q: "How do I know if my registration is confirmed?", a: "You'll receive a WhatsApp message on the number you registered with once your payment is verified." },
  { q: "Is re-entry automatic?", a: "No. Teams who want to re-enter must pay ₹40 separately and contact the organizers after elimination." },
];

export function FAQContent() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div style={{ border: "1px solid #eaeaea", borderRadius: 22, overflow: "hidden" }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid #eaeaea" : "none" }}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "22px 28px",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafafa"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
          >
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 600, color: openIdx === i ? "#e50914" : "#111", letterSpacing: "-0.01em" }}>
              {faq.q}
            </span>
            <ChevronDown
              size={18}
              style={{ flexShrink: 0, color: "#e50914", transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
            />
          </button>
          <div
            style={{
              maxHeight: openIdx === i ? 200 : 0,
              overflow: "hidden",
              transition: "max-height 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, padding: "0 28px 22px" }}>{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
