"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Calendar, Clock, Swords, Lock, Copy, Radio, MessageSquare, ShieldCheck, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export interface MatchItem {
  id: string;
  name: string;
  map: string;
  round: string;
  matchTime: string;
  matchStartTime?: string;
  roomRevealTime?: string;
  regCloseTime?: string;
  maxSquads?: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  isPublished?: boolean;
  isArchived?: boolean;
  bannerUrl?: string;
  streamUrl?: string;
  whatsappUrl?: string;
  rules?: string;
  description?: string;
}

interface RoomCredentials {
  canView: boolean;
  roomId?: string;
  roomPassword?: string;
  revealTime?: string;
  matchStartTime?: string;
}

const STATUS_STYLES = {
  live: {
    bg: "rgba(229,9,20,0.06)",
    color: "#e50914",
    border: "rgba(229,9,20,0.18)",
    label: "🔴 LIVE NOW",
  },
  upcoming: {
    bg: "rgba(17,17,17,0.03)",
    color: "#444",
    border: "rgba(17,17,17,0.06)",
    label: "SCHEDULED",
  },
  completed: {
    bg: "rgba(34,197,94,0.06)",
    color: "#16a34a",
    border: "rgba(34,197,94,0.15)",
    label: "COMPLETED",
  },
  cancelled: {
    bg: "rgba(239,68,68,0.06)",
    color: "#dc2626",
    border: "rgba(239,68,68,0.15)",
    label: "CANCELLED",
  },
};

// Sub-component for individual Match Card with Live Auto Reveal & Countdown
function MatchCardItem({ m }: { m: MatchItem }) {
  const [creds, setCreds] = useState<RoomCredentials>({ canView: false });
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // Compute Target Reveal Time
  const startTimeMs = new Date(m.matchStartTime || m.matchTime).getTime();
  const revealTimeMs = m.roomRevealTime
    ? new Date(m.roomRevealTime).getTime()
    : startTimeMs > 0
    ? startTimeMs - 10 * 60 * 1000
    : 0;

  // Real-time Countdown & Automated Server Validation Poll
  useEffect(() => {
    const fetchRoomCredentials = async () => {
      try {
        const res = await fetch(`/api/matches/${m.id}/room`);
        if (res.ok) {
          const data = await res.json();
          setCreds(data);
          if (data.canView) {
            setIsRevealed(true);
          }
        }
      } catch (err) {
        console.error("Room fetch error:", err);
      }
    };

    const updateTimer = () => {
      const now = Date.now();
      const isLiveNow = m.status === "live";

      if (isLiveNow || (revealTimeMs > 0 && now >= revealTimeMs)) {
        setTimeLeftStr("00h 00m 00s");
        if (!isRevealed) {
          fetchRoomCredentials();
        }
        return;
      }

      if (revealTimeMs > 0) {
        const diff = revealTimeMs - now;
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          const pad = (n: number) => String(n).padStart(2, "0");
          setTimeLeftStr(`${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`);
        } else {
          setTimeLeftStr("00h 00m 00s");
          fetchRoomCredentials();
        }
      } else {
        setTimeLeftStr("Locked");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [m.id, m.status, revealTimeMs, isRevealed]);

  const statusStyle = STATUS_STYLES[m.status] || STATUS_STYLES.upcoming;
  const isMatchLive = m.status === "live";

  let dateDisplay = "TBD";
  let timeDisplay = "TBD";

  if (m.matchTime || m.matchStartTime) {
    try {
      const dObj = new Date(m.matchStartTime || m.matchTime);
      if (!isNaN(dObj.getTime())) {
        dateDisplay = dObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        timeDisplay = dObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      }
    } catch {}
  }

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: `1.5px solid ${isRevealed || isMatchLive ? "#22C55E" : "#eaeaea"}`,
        overflow: "hidden",
        boxShadow: isRevealed || isMatchLive
          ? "0 10px 30px rgba(34, 197, 94, 0.15)"
          : "0 4px 20px rgba(0, 0, 0, 0.03)",
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {/* Banner Image */}
      {m.bannerUrl && (
        <div style={{ height: 140, width: "100%", overflow: "hidden", background: "#111" }}>
          <img src={m.bannerUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      <div style={{ padding: 24 }}>
        {/* Header: Stage & Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {m.round} • {m.map}
          </span>

          <span
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              background: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.04em",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isMatchLive && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#e50914",
                  boxShadow: "0 0 8px #e50914",
                  animation: "pulse 1.5s infinite",
                }}
              />
            )}
            {statusStyle.label}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: "#111",
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          {m.name}
        </h3>

        {/* Date & Time info */}
        <div style={{ display: "flex", gap: 16, marginBottom: 18, fontSize: 13, color: "#555" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={14} style={{ color: "#e50914" }} />
            <span>{dateDisplay}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} style={{ color: "#e50914" }} />
            <span>{timeDisplay}</span>
          </div>
        </div>

        {/* SECURE AUTO ROOM REVEAL CARD */}
        {creds.canView ? (
          /* REVEALED CARD (Green Glow UI) */
          <div
            style={{
              background: "#F0FDF4",
              border: "1.5px solid #BBF7D0",
              borderRadius: 16,
              padding: 16,
              marginBottom: 18,
              boxShadow: "0 4px 20px rgba(34, 197, 94, 0.1)",
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={18} style={{ color: "#16A34A" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#15803D", textTransform: "uppercase" }}>
                🎮 Room Details Unlocked
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: 10, border: "1px solid #DCFCE7" }}>
                <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#15803D", textTransform: "uppercase" }}>
                  Room ID
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <strong style={{ fontSize: 15, fontFamily: "monospace", color: "#0F172A" }}>
                    {creds.roomId}
                  </strong>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(creds.roomId!);
                      toast.success("Room ID Copied! 🎉");
                    }}
                    style={{ background: "none", border: "none", color: "#16A34A", cursor: "pointer", padding: 2 }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div style={{ background: "#FFFFFF", padding: "10px 12px", borderRadius: 10, border: "1px solid #DCFCE7" }}>
                <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#15803D", textTransform: "uppercase" }}>
                  Password
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <strong style={{ fontSize: 15, fontFamily: "monospace", color: "#0F172A" }}>
                    {creds.roomPassword}
                  </strong>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(creds.roomPassword!);
                      toast.success("Room Password Copied! 🎉");
                    }}
                    style={{ background: "none", border: "none", color: "#16A34A", cursor: "pointer", padding: 2 }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LOCKED CARD (Grey Glass UI with Countdown) */
          <div
            style={{
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: 16,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Lock size={16} style={{ color: "#64748B" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>
                🔒 Room Details Locked
              </span>
            </div>

            <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, marginBottom: 12 }}>
              Room ID & Password will automatically be revealed <strong>10 minutes before match start time</strong>.
            </p>

            <div style={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 10, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Room Opens In
              </span>
              <strong style={{ fontSize: 14, fontFamily: "monospace", color: "#DC2626", fontWeight: 800 }}>
                {timeLeftStr}
              </strong>
            </div>
          </div>
        )}

        {/* External Action Links (Stream & WhatsApp) */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {m.streamUrl && (
            <a
              href={m.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                background: "#e50914",
                color: "#ffffff",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 10px rgba(229,9,20,0.25)",
              }}
            >
              <Radio size={14} /> Watch Stream
            </a>
          )}

          {m.whatsappUrl && (
            <a
              href={m.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                background: "#25D366",
                color: "#ffffff",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <MessageSquare size={14} /> Join Lobby Group
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function MatchSchedule() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "live" | "completed">("all");

  useEffect(() => {
    try {
      const q = query(collection(db, "matches"), orderBy("createdAt", "asc"));
      const unsub = onSnapshot(q, (snap) => {
        const STAGE_ORDER: Record<string, number> = {
          "qualifier 1": 1,
          "qualifier 2": 2,
          "round 2": 3,
          "semi final": 4,
          "grand final": 5,
        };

        const getRank = (item: MatchItem) => {
          const text = `${item.name || ""} ${item.round || ""}`.toLowerCase();
          for (const [k, r] of Object.entries(STAGE_ORDER)) {
            if (text.includes(k)) return r;
          }
          return 99;
        };

        const list: MatchItem[] = snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MatchItem))
          .filter((m) => m.isPublished !== false && !m.isArchived)
          .sort((a, b) => {
            const rA = getRank(a);
            const rB = getRank(b);
            if (rA !== rB) return rA - rB;
            const tA = a.matchTime || a.matchStartTime || "";
            const tB = b.matchTime || b.matchStartTime || "";
            if (tA && tB) return tA.localeCompare(tB);
            return (a.name || "").localeCompare(b.name || "");
          });
        setMatches(list);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.error("Failed to fetch live matches:", e);
      setLoading(false);
    }
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (activeFilter === "all") return true;
    return m.status === activeFilter;
  });

  return (
    <section style={{ padding: "80px 0", background: "#ffffff" }}>
      <div className="container-custom">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="badge badge-accent" style={{ marginBottom: 16 }}>
            ⚔️ Tournament Match Schedule
          </span>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Live Match Schedule & Auto Room Reveal
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>
            Real-time match schedule. Room ID and Passwords automatically unlock exactly 10 minutes before the match start time.
          </p>

          {/* Filter Tabs */}
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              marginTop: 24,
              background: "#f5f5f5",
              padding: 6,
              borderRadius: 14,
              border: "1px solid #eaeaea",
            }}
          >
            {(["all", "upcoming", "live", "completed"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: activeFilter === filter ? "#e50914" : "transparent",
                  color: activeFilter === filter ? "#ffffff" : "#666",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                {filter === "live" ? "🔴 Live" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 220, borderRadius: 20, background: "#f5f5f5" }} />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#fafafa",
              borderRadius: 24,
              border: "1px dashed #eaeaea",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            <Swords size={40} style={{ color: "#ccc", marginBottom: 14 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 6 }}>
              No matches found
            </h3>
            <p style={{ fontSize: 14, color: "#666" }}>
              Check back soon! Tournament matches will be published here in real-time.
            </p>
          </div>
        ) : (
          /* Matches List */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 24 }}>
            {filteredMatches.map((m) => (
              <MatchCardItem key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
