"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";
import {
  Users, Trophy, Wallet, CheckCircle, Clock, TrendingUp,
  Swords, Zap, Plus, Bell, Settings, ChevronRight, Eye, Check, X, Shield
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DangerZoneCard } from "@/components/admin/DangerZoneCard";
import { useAdminStore } from "@/store/useAdminStore";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Link from "next/link";
import toast from "react-hot-toast";
import { updateDoc } from "firebase/firestore";

const PIE_COLORS = ["#F59E0B", "#22C55E", "#EF4444"];

export default function DashboardPage() {
  const { theme } = useAdminStore();
  const isDark = theme === "dark";

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
  const liveMatches = matches.filter((m) => m.status === "live").length;

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "registrations", id), { status });
    toast.success(`Registration ${status}`);
  };

  // 7-day registration growth
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

  const QUICK_ACTIONS = [
    { label: "Registrations", sub: "Review & approve squads", icon: Users, href: "/admin/registrations", gradient: "linear-gradient(135deg, #2563EB, #1D4ED8)", count: pending },
    { label: "Create Match", sub: "Schedule 4v4 matches", icon: Swords, href: "/admin/matches", gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)", count: liveMatches },
    { label: "Announcements", sub: "Publish player alerts", icon: Bell, href: "/admin/announcements", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
    { label: "Settings", sub: "Tournament rules & fee", icon: Settings, href: "/admin/settings", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* 1. Header (36px Heading) */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ONLY GOAT'S ESPORTS
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            fontWeight: 900,
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontFamily: "Space Grotesk, Inter, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Admin Overview Dashboard
        </h1>
        <p style={{ fontSize: 15, color: isDark ? "#94A3B8" : "#64748B", marginTop: 6, fontWeight: 500 }}>
          Real-time squad performance, dynamic leaderboard management, and active tournament controls.
        </p>
      </div>

      {/* 2. STATS SECTION (4 Equal Cards, Height 140px, Rounded 24px, Soft Shadow, Gradient Circle Icon, 36px Number) */}
      <div
        className="admin-stats-grid"
        style={{
          display: "grid",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <StatsCard
          title="Registered Teams"
          value={total}
          icon={Users}
          iconGradient="linear-gradient(135deg, #38BDF8, #0284C7)"
          subtitle={`${maxTeams - total} slots available`}
        />
        <StatsCard
          title="Approved Teams"
          value={approved}
          icon={CheckCircle}
          iconGradient="linear-gradient(135deg, #22C55E, #16A34A)"
        />
        <StatsCard
          title="Pending Payments"
          value={pending}
          icon={Clock}
          iconGradient="linear-gradient(135deg, #F59E0B, #D97706)"
        />
        <StatsCard
          title="Prize Pool"
          value={`₹${prizePool.toLocaleString()}`}
          icon={Trophy}
          iconGradient="linear-gradient(135deg, #A855F7, #7C3AED)"
          accent
        />
      </div>

      {/* 3. QUICK ACTIONS (Desktop 4 cols, Tablet 2 cols, Mobile 1 col) */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A", marginBottom: 16 }}>
          Quick Action Shortcuts
        </h2>
        <div
          className="admin-quick-actions-grid"
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          {QUICK_ACTIONS.map(({ label, sub, icon: Icon, href, gradient, count }) => (
            <Link key={label} href={href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: isDark ? "#111827" : "#FFFFFF",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
                  borderRadius: 24,
                  padding: "20px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                  boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 10px 30px rgba(0,0,0,0.03)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 14px 35px rgba(37, 99, 235, 0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 10px 30px rgba(0,0,0,0.03)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      background: gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A", margin: 0 }}>{label}</h4>
                    <p style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#64748B", margin: 0, marginTop: 2 }}>{sub}</p>
                  </div>
                </div>

                {count !== undefined && count > 0 && (
                  <span
                    style={{
                      background: "#2563EB",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "4px 10px",
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

      {/* 4. CHARTS SECTION (Desktop: 8-column Registration Growth, 4-column Squad Status) */}
      <div
        className="admin-charts-grid"
        style={{
          display: "grid",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* Registration Growth Chart (8 Columns Desktop) */}
        <div
          style={{
            background: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24,
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            padding: "24px",
            boxShadow: isDark ? "0 10px 30px rgba(0, 0, 0, 0.2)" : "0 10px 30px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Registration Growth (7 Days)
              </h3>
              <p style={{ fontSize: 13, color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}>
                Daily squad onboarding analytics
              </p>
            </div>
            <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 800, background: isDark ? "rgba(37,99,235,0.2)" : "#EFF6FF", padding: "4px 10px", borderRadius: 8 }}>
              Live Telemetry
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9"} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? "#64748B" : "#94A3B8" }} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? "#64748B" : "#94A3B8" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#0F172A" : "#FFFFFF",
                  borderRadius: 12,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  fontSize: 13,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3.5} dot={{ fill: "#2563EB", r: 5 }} name="Registrations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Squad Status Ratio Pie Chart (4 Columns Desktop) */}
        <div
          style={{
            background: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24,
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            padding: "24px",
            boxShadow: isDark ? "0 10px 30px rgba(0, 0, 0, 0.2)" : "0 10px 30px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A", marginBottom: 4 }}>
            Squad Status Ratio
          </h3>
          <p style={{ fontSize: 13, color: isDark ? "#94A3B8" : "#64748B", marginBottom: 12 }}>
            Approved vs Pending vs Rejected
          </p>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: isDark ? "#0F172A" : "#FFFFFF",
                    borderRadius: 12,
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i] }} />
                  <span style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#64748B", fontWeight: 600 }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 900, color: isDark ? "#F8FAFC" : "#0F172A", marginTop: 2, display: "block" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. RECENT REGISTRATIONS (Modern Card List Layout) */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            background: isDark ? "#111827" : "#FFFFFF",
            borderRadius: 24,
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            padding: "24px",
            boxShadow: isDark ? "0 10px 30px rgba(0, 0, 0, 0.2)" : "0 10px 30px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A" }}>
                Recent Squad Registrations
              </h2>
              <p style={{ fontSize: 13, color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}>
                Latest tournament team applications
              </p>
            </div>
            <Link
              href="/admin/registrations"
              style={{
                fontSize: 13,
                color: "#2563EB",
                textDecoration: "none",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View all registrations <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 68, borderRadius: 16, background: isDark ? "#1E293B" : "#F1F5F9" }} />
              ))}
            </div>
          ) : recentRegs.length === 0 ? (
            <p style={{ fontSize: 14, color: isDark ? "#94A3B8" : "#64748B", textAlign: "center", padding: "32px 0" }}>
              No squad registrations submitted yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentRegs.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    background: isDark ? "rgba(255, 255, 255, 0.03)" : "#F8FAFC",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #E2E8F0",
                    borderRadius: 18,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 14,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 15,
                        boxShadow: "0 0 14px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      {reg.teamName?.slice(0, 2).toUpperCase() || "SQ"}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: isDark ? "#F8FAFC" : "#0F172A", margin: 0 }}>
                        {reg.teamName || "Unnamed Squad"}
                      </h4>
                      <p style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#64748B", marginTop: 2, margin: 0 }}>
                        Captain: <strong>{reg.captain?.name || "N/A"}</strong> ({reg.phone || "No phone"})
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <StatusBadge status={reg.status || "pending"} />
                    <div style={{ display: "flex", gap: 6 }}>
                      {reg.status !== "approved" && (
                        <button
                          onClick={() => handleUpdateStatus(reg.id, "approved")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "#22C55E",
                            color: "#FFF",
                            border: "none",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Approve
                        </button>
                      )}
                      <Link
                        href={`/admin/registrations`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: isDark ? "rgba(37, 99, 235, 0.2)" : "#EFF6FF",
                          color: "#2563EB",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        Manage
                      </Link>
                    </div>
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
        /* Responsive Grid Breakdown */
        @media (max-width: 767px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-quick-actions-grid {
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
          .admin-quick-actions-grid {
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
          .admin-quick-actions-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .admin-charts-grid {
            grid-template-columns: 8fr 4fr !important;
          }
        }
      `}</style>
    </div>
  );
}
