"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";
import {
  Users, Trophy, Wallet, CheckCircle, Clock, TrendingUp,
  Swords, Zap, Plus, Bell, Settings, ChevronRight
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import Link from "next/link";

const ACCENT = "#EF4444";
const PIE_COLORS = ["#F59E0B", "#22C55E", "#EF4444"];

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubRegs = onSnapshot(collection(db, "registrations"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRegistrations(data);
      setLoading(false);
    });
    const unsubMatches = onSnapshot(collection(db, "matches"), snap => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSettings = onSnapshot(doc(db, "settings", "tournament"), snap => {
      if (snap.exists()) setSettings(snap.data());
    });
    const qRecent = query(collection(db, "registrations"), orderBy("createdAt", "desc"), limit(5));
    const unsubRecent = onSnapshot(qRecent, snap => {
      setRecentRegs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubRegs(); unsubMatches(); unsubSettings(); unsubRecent(); };
  }, []);

  const approved = registrations.filter(r => r.status === "approved").length;
  const pending = registrations.filter(r => r.status === "pending").length;
  const rejected = registrations.filter(r => r.status === "rejected").length;
  const total = registrations.length;
  const maxTeams = settings.maxTeams || 24;
  const prizePool = settings.prizePool || 1000;
  const entryFee = settings.entryFee || 100;
  const revenue = approved * entryFee;
  const liveMatches = matches.filter(m => m.status === "live").length;

  // Build registration growth chart (last 7 days)
  const growthData = (() => {
    const days: Record<string, number> = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      days[d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })] = 0;
    }
    registrations.forEach(r => {
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

  const revenueData = growthData.map(d => ({ ...d, revenue: d.count * entryFee }));

  const QUICK_ACTIONS = [
    { label: "Registrations", icon: Users, href: "/admin/registrations", color: "#EF4444" },
    { label: "Create Match", icon: Swords, href: "/admin/matches", color: "#8B5CF6" },
    { label: "Announcement", icon: Bell, href: "/admin/announcements", color: "#F59E0B" },
    { label: "Settings", icon: Settings, href: "/admin/settings", color: "#0EA5E9" },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4, fontFamily: "Inter, sans-serif" }}>
          Welcome back — here's what's happening with your tournament.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
        <StatsCard title="Registered Teams" value={total} icon={Users}
          iconColor="#EF4444" iconBg="#FEF2F2" subtitle={`${maxTeams - total} slots remaining`} />
        <StatsCard title="Approved Teams" value={approved} icon={CheckCircle}
          iconColor="#22C55E" iconBg="#DCFCE7" />
        <StatsCard title="Pending Payments" value={pending} icon={Clock}
          iconColor="#F59E0B" iconBg="#FEF9C3" />
        <StatsCard title="Prize Pool" value={`₹${prizePool.toLocaleString()}`} icon={Trophy}
          iconColor="#8B5CF6" iconBg="#EDE9FE" />
        <StatsCard title="Revenue" value={`₹${revenue.toLocaleString()}`} icon={Wallet}
          iconColor="#0EA5E9" iconBg="#E0F2FE" />
        <StatsCard title="Live Matches" value={liveMatches} icon={Swords}
          accent={liveMatches > 0} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16, marginBottom: 28 }}>
        {/* Registration Growth */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0",
          padding: "20px 20px 12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 16, fontFamily: "Inter, sans-serif" }}>
            Registration Growth (7 days)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2}
                dot={{ fill: ACCENT, r: 3 }} name="Registrations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0",
          padding: "20px 20px 12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 16, fontFamily: "Inter, sans-serif" }}>
            Revenue (₹)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#EF4444" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0",
          padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column",
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 12, fontFamily: "Inter, sans-serif" }}>
            Team Status
          </h3>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                  <span style={{ fontSize: 11, color: "#64748B", fontFamily: "Inter, sans-serif" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Recent Registrations */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0",
          padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
              Recent Registrations
            </h3>
            <Link href="/admin/registrations" style={{
              fontSize: 12, color: ACCENT, textDecoration: "none", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 4, fontFamily: "Inter, sans-serif",
            }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 48, borderRadius: 8, background: "#F1F5F9" }} />)}
            </div>
          ) : recentRegs.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", padding: "20px 0", fontFamily: "Inter, sans-serif" }}>
              No registrations yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {recentRegs.map(reg => (
                <div key={reg.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: 10, fontFamily: "Inter, sans-serif",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: "#FEF2F2",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: ACCENT,
                    }}>
                      {reg.teamName?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{reg.teamName || "—"}</p>
                      <p style={{ fontSize: 11, color: "#94A3B8" }}>{reg.captain?.name || reg.phone || "—"}</p>
                    </div>
                  </div>
                  <StatusBadge status={reg.status || "pending"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0",
          padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 16, fontFamily: "Inter, sans-serif" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  border: "1px solid #E2E8F0", cursor: "pointer",
                  transition: "all 0.15s", fontFamily: "Inter, sans-serif",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = color;
                    (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0";
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: color + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A", flex: 1 }}>{label}</span>
                  <ChevronRight size={14} color="#94A3B8" />
                </div>
              </Link>
            ))}
          </div>

          {/* Tournament status */}
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "Inter, sans-serif" }}>
              Registration Status
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: settings.registrationOpen ? "#22C55E" : "#EF4444",
                ...(settings.registrationOpen ? { animation: "statusPulse 1.5s ease-in-out infinite" } : {}),
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
                {settings.registrationOpen ? "Open" : "Closed"}
              </span>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#64748B", fontFamily: "Inter, sans-serif" }}>Teams filled</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>
                  {total}/{maxTeams}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#E2E8F0" }}>
                <div style={{
                  height: "100%", borderRadius: 3, background: ACCENT,
                  width: `${Math.min(100, (total / maxTeams) * 100)}%`,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
