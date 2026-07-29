"use client";

import { useState } from "react";
import { ChevronDown, Search, Shield, Users, Trophy, AlertTriangle, Wifi, RotateCcw } from "lucide-react";

const RULES = [
  {
    category: "Team Composition",
    icon: Users,
    items: [
      { q: "How many players per team?", a: "Each team must have 4 main players and 1 substitute. The substitute can only play if a main player disconnects or is unavailable before match start." },
      { q: "Can I change team members after registration?", a: "Team members cannot be changed after registration is confirmed. Ensure all player details are correct before submission." },
      { q: "What are the UID requirements?", a: "All players must provide their valid Free Fire UID at registration. Fake UIDs will result in immediate disqualification." },
    ],
  },
  {
    category: "Match Rules",
    icon: Shield,
    items: [
      { q: "What happens if a player disconnects?", a: "Disconnections are not the organizer's responsibility. Teams must be ready at match time. A 5-minute grace period will be given after which the match proceeds." },
      { q: "Which map is played?", a: "All matches are played on Bermuda (Classic). Both qualifier matches and CS League rounds use Bermuda." },
      { q: "What room settings are used?", a: "Classic mode, Bermuda map, TPP, squad. Custom rooms will be created by organizers and room ID/password shared 15 minutes before match time." },
    ],
  },
  {
    category: "Fair Play",
    icon: AlertTriangle,
    items: [
      { q: "Are hacks/mods allowed?", a: "Absolutely not. Any use of hacks, mods, or third-party software results in immediate, permanent disqualification of the entire team. Zero tolerance." },
      { q: "How is cheating detected?", a: "Organizers will review match recordings, kill feeds, and gameplay data. Players may be asked to share screen recordings as proof." },
      { q: "What happens if I teaming with enemies?", a: "Intentional teaming with enemy squads is strictly prohibited and results in disqualification." },
      { q: "Can I stream the matches?", a: "Yes, streaming is allowed and encouraged. Please mention 'Only Goats FF' in your stream title. Delay your stream by at least 2 minutes." },
    ],
  },
  {
    category: "Payment & Prizes",
    icon: Trophy,
    items: [
      { q: "What is the entry fee?", a: "₹100 per team for the main registration. If your team wants to re-enter after elimination, the re-entry fee is ₹40." },
      { q: "How do I pay?", a: "Payment is made via UPI. After completing payment, upload the screenshot and enter the transaction ID in the registration form." },
      { q: "How is the prize distributed?", a: "The ₹1000 prize pool is awarded to the Champion squad. Prize will be sent via UPI within 24 hours of the tournament ending." },
      { q: "Is the entry fee refundable?", a: "Entry fees are non-refundable once registration is confirmed. In case the tournament is cancelled by organizers, full refund will be processed." },
    ],
  },
  {
    category: "Technical",
    icon: Wifi,
    items: [
      { q: "What if the server crashes during a match?", a: "If the match is less than 50% complete, it will be replayed. If more than 50% complete, results stand as they are at the point of crash." },
      { q: "Can I use emulator?", a: "No emulators are allowed. Mobile device only. Players found using emulators will be disqualified." },
    ],
  },
  {
    category: "Re-Entry",
    icon: RotateCcw,
    items: [
      { q: "How does re-entry work?", a: "Teams eliminated in the qualifier stage can re-enter the CS League stage by paying ₹40. Re-entry is limited to available slots." },
      { q: "Can a team re-enter multiple times?", a: "No. Each team can only re-enter once per tournament." },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion-item">
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <ChevronDown
          size={18}
          style={{
            flexShrink: 0,
            color: "#e50914",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
      <div
        className="accordion-content"
        style={{
          maxHeight: open ? 300 : 0,
          paddingBottom: open ? 20 : 0,
          transition: "max-height 0.35s cubic-bezier(0.25,0.46,0.45,0.94), padding 0.2s",
        }}
      >
        {a}
      </div>
    </div>
  );
}

export function RulesContent() {
  const [search, setSearch] = useState("");

  const filtered = RULES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div>
      {/* Search */}
      <div
        style={{
          position: "relative",
          marginBottom: 60,
          maxWidth: 480,
          margin: "0 auto 60px",
        }}
      >
        <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
        <input
          type="text"
          placeholder="Search rules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px 14px 48px",
            border: "1.5px solid #eaeaea",
            borderRadius: 14,
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            color: "#111",
            background: "#fff",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#e50914"; }}
          onBlur={(e) => { e.target.style.borderColor = "#eaeaea"; }}
        />
      </div>

      {/* Categories */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No results found</p>
          <p style={{ fontSize: 14 }}>Try a different search term</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {filtered.map(({ category, icon: Icon, items }) => (
            <div key={category}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(229,9,20,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} style={{ color: "#e50914" }} />
                </div>
                <h2
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {category}
                </h2>
              </div>
              <div style={{ border: "1px solid #eaeaea", borderRadius: 18, overflow: "hidden", padding: "0 28px" }}>
                {items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
