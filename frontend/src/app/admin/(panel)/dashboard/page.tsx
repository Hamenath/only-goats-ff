"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";
import {
  Users, Trophy, Wallet, CheckCircle, Clock, TrendingUp,
  Swords, Zap, Plus, Bell, Settings, ChevronRight, Shield
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DangerZoneCard } from "@/components/admin/DangerZoneCard";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Link from "next/link";

const PIE_COLORS = ["#F59E0B", "#22C55E", "#EF4444"];

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubRegs = onSnapshot(collection(db, "registrations"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRegistrations(data);
      setLoading(false);
    });
    const unsubMatches = onSnapshot(collection(db, "matches"), (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubSettings = onSnapshot(doc(db, "settings", "tournament"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    const qRecent = query(collection(db, "registrations"), orderBy("createdAt", "desc"), limit(5));
    const unsubRecent = onSnapshot(qRecent, (snap) => {
      setRecentRegs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubRegs();
      unsubMatches();
      unsubSettings();
      unsubRecent();
    };
  }, []);

  const approved = registrations.filter((r) => r.status === "approved").length;
  const pending = registrations.filter((r) => r.status === "pending").length;
  const rejected = registrations.filter((r) => r.status === "rejected").length;
  const total = registrations.length;
  const maxTeams = settings.maxTeams || 24;
  const prizePool = settings.prizePool || 1000;
  const entryFee = settings.entryFee || 100;
  const revenue = approved * entryFee;
  const liveMatches = matches.filter((m) => m.status === "live").length;

  // Build registration growth chart (last 7 days)
  const growthData = (() => {
    const days: Record<string, number> = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      days[d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })] = 0;
    }
    registrations.forEach((r) => {
      if (r.createdAt?.seconds) {
        const d = new Date(r.createdAt.seconds * 1000);
        const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        if (key in days) days[key]++;
      }
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  })();

  const pieData = [
    { name: "Pending", value: pending || 0 },
    { name: "Approved", value: approved || 0 },
    { name: "Rejected", value: rejected || 0 },
  ];

  const revenueData = growthData.map((d) => ({ ...d, revenue: d.count * entryFee }));

  const QUICK_ACTIONS = [
    { label: "Registrations", icon: Users, href: "/admin/registrations", color: "#38BDF8", count: pending },
    { label: "Create Match", icon: Swords, href: "/admin/matches", color: "#8B5CF6", count: liveMatches },
    { label: "Announce", icon: Bell, href: "/admin/announcements", color: "#F59E0B" },
    { label: "Settings", icon: Settings, href: "/admin/settings", color: "#10B981" },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* 1. Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ONLY GOAT'S ESPORTS
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 30px)",
            fontWeight: 900,
            color: "#F8FAFC",
            fontFamily: "Space Grotesk, Inter, sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Admin Control Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#94A3B8", marginTop: 6 }}>
          Real-time tournament monitoring, squad management, and live match control center.
        </p>
      </div>

      {/* 2. STATS GRID (Stacked 100% width on Mobile, 2 cols on Tablet, 4 cols on Desktop) */}
      <div
        className="admin-stats-grid"
        style={{
          display: "grid",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatsCard
          title="Registered Teams"
          value={total}
          icon={Users}
          iconColor="#38BDF8"
          iconBg="rgba(56, 189, 248, 0.12)"
          subtitle={`${maxTeams - total} slots remaining`}
        />
        <StatsCard
          title="Approved Teams"
          value={approved}
          icon={CheckCircle}
          iconColor="#4ADE80"
          iconBg="rgba(74, 222, 128, 0.12)"
        />
        <StatsCard
          title="Pending Payments"
          value={pending}
          icon={Clock}
          iconColor="#FBBF24"
          iconBg="rgba(251, 191, 36, 0.12)"
        />
        <StatsCard
          title="Prize Pool"
          value={`₹${prizePool.toLocaleString()}`}
          icon={Trophy}
          iconColor="#A855F7"
          iconBg="rgba(168, 85, 247, 0.12)"
          accent
        />
      </div>

      {/* 3. QUICK ACTIONS BAR */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", marginBottom: 14 }}>
          Quick Action Shortcuts
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {QUICK_ACTIONS.map(({ label, icon: Icon, href, color, count }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "#111827",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 16,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = color;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255, 255, 255, 0.08)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${color}1A`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} color={color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{label}</span>
                </div>
                {count !== undefined && count > 0 && (
                  <span
                    style={{
                      background: color,
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 100,
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. CHARTS SECTION (Responsive Grid) */}
      <div
        className="admin-charts-grid"
        style={{
          display: "grid",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Registration Growth Chart */}
        <div
          style={{
            background: "#111827",
            borderRadius: 20,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "20px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#F8FAFC" }}>
              Registration Growth (7 Days)
            </h3>
            <span style={{ fontSize: 11, color: "#38BDF8", fontWeight: 700 }}>Live Feed</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0F172A", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.1)", color: "#F8FAFC", fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#38BDF8" strokeWidth={3} dot={{ fill: "#38BDF8", r: 4 }} name="Registrations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div
          style={{
            background: "#111827",
            borderRadius: 20,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "20px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#F8FAFC", marginBottom: 12 }}>
            Squad Status Ratio
          </h3>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0F172A", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.1)", color: "#F8FAFC", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                  <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#F8FAFC", marginTop: 2, display: "block" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. RECENT REGISTRATIONS (Card List for Mobile View) */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            background: "#111827",
            borderRadius: 20,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "20px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC" }}>
              Recent Squad Registrations
            </h2>
            <Link
              href="/admin/registrations"
              style={{
                fontSize: 13,
                color: "#38BDF8",
                textDecoration: "none",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 60, borderRadius: 12, background: "#1E293B" }} />
              ))}
            </div>
          ) : recentRegs.length === 0 ? (
            <p style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", padding: "24px 0" }}>
              No squad registrations recorded yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentRegs.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 14,
                        boxShadow: "0 0 12px rgba(37, 99, 235, 0.3)",
                      }}
                    >
                      {reg.teamName?.slice(0, 2).toUpperCase() || "SQ"}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>
                        {reg.teamName || "Unnamed Squad"}
                      </h4>
                      <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, margin: 0 }}>
                        Captain: <strong>{reg.captain?.name || "N/A"}</strong> ({reg.phone || "No phone"})
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StatusBadge status={reg.status || "pending"} />
                    <Link
                      href={`/admin/registrations`}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "#38BDF8",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. DANGER ZONE */}
      <DangerZoneCard />

      <style jsx global>{`
        /* Responsive Grid Adjustments */
        @media (max-width: 767px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .admin-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .admin-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 1024px) {
          .admin-stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .admin-charts-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
