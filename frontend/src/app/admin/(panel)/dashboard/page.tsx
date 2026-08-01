"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import {
  Users, Trophy, Wallet, CheckCircle, Clock, TrendingUp,
  Swords, Zap, Plus, Bell, Settings, ChevronRight, Filter, Download,
  Check, X, Eye
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsWidget } from "@/components/admin/StatsWidget";
import { QuickActionCard } from "@/components/admin/QuickActionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DangerZoneCard } from "@/components/admin/DangerZoneCard";
import { ImageModal } from "@/components/admin/ImageModal";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Link from "next/link";
import toast from "react-hot-toast";

const BLUE_ACCENT = "#2563EB";
const PIE_COLORS = ["#F59E0B", "#22C55E", "#EF4444"];

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

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
    const qRecent = query(collection(db, "registrations"), orderBy("createdAt", "desc"), limit(6));
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

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "registrations", id), { status });
    toast.success(`Registration ${status}`);
  };

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

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto" }}>
      {/* 1. Universal Page Header */}
      <AdminPageHeader
        category="Admin"
        title="Dashboard"
        description="Monitor tournaments, registrations, revenue and live esports matches in real-time."
        badgeLabel="ESPORTS CONTROL CENTER"
        actions={
          <>
            <Link href="/admin/tournaments" style={{ textDecoration: "none" }}>
              <button
                style={{
                  height: 46,
                  padding: "0 20px",
                  borderRadius: 16,
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  color: "#0F172A",
                  fontWeight: 600,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                  transition: "all 0.2s ease",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <Trophy size={16} color="#2563EB" />
                Tournament Rules
              </button>
            </Link>
            <Link href="/admin/matches" style={{ textDecoration: "none" }}>
              <button
                style={{
                  height: 46,
                  padding: "0 20px",
                  borderRadius: 16,
                  background: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                  transition: "all 0.2s ease",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                Create Match
              </button>
            </Link>
          </>
        }
      />

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8 w-full">
        <StatsWidget
          title="Registered Teams"
          value={total}
          subtitle={`${maxTeams - total} slots remaining`}
          icon={Users}
          iconColor="#2563EB"
          iconBg="rgba(37, 99, 235, 0.08)"
          trend={{ value: 12, label: "vs last week" }}
          footer={`${total} / ${maxTeams} Total slots filled`}
        />
        <StatsWidget
          title="Approved Squads"
          value={approved}
          subtitle="Ready for battle"
          icon={CheckCircle}
          iconColor="#22C55E"
          iconBg="rgba(34, 197, 94, 0.08)"
          trend={{ value: 8, label: "this tournament" }}
          footer="All payment verifications done"
        />
        <StatsWidget
          title="Pending Payments"
          value={pending}
          subtitle="Action required"
          icon={Clock}
          iconColor="#F59E0B"
          iconBg="rgba(245, 158, 11, 0.08)"
          footer="Awaiting payment screenshot verification"
        />
        <StatsWidget
          title="Prize Pool"
          value={`₹${prizePool.toLocaleString()}`}
          subtitle="Total distribution"
          icon={Trophy}
          iconColor="#8B5CF6"
          iconBg="rgba(139, 92, 246, 0.08)"
          footer="Official tournament prize pool"
        />
        <StatsWidget
          title="Total Revenue"
          value={`₹${revenue.toLocaleString()}`}
          subtitle={`₹${entryFee}/team`}
          icon={Wallet}
          accent={true}
          footer="Calculated from approved registrations"
        />
        <StatsWidget
          title="Live Matches"
          value={liveMatches}
          subtitle="Active lobbies"
          icon={Swords}
          iconColor="#EF4444"
          iconBg="rgba(239, 68, 68, 0.08)"
          footer="Real-time live battle status"
        />
      </div>

      {/* 3. Quick Actions Cards Row */}
      <div style={{ marginBottom: 32 }}>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0F172A",
            marginBottom: 16,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
          <QuickActionCard
            label="Create Tournament"
            description="Set up tournament format, slots & prize pool"
            icon={Trophy}
            href="/admin/tournaments"
            color="#2563EB"
            badge="POPULAR"
          />
          <QuickActionCard
            label="Create Match"
            description="Schedule match, room ID & password details"
            icon={Swords}
            href="/admin/matches"
            color="#8B5CF6"
          />
          <QuickActionCard
            label="Publish Announcement"
            description="Broadcast alerts & updates to all players"
            icon={Bell}
            href="/admin/announcements"
            color="#F59E0B"
          />
          <QuickActionCard
            label="Approve Teams"
            description="Review and verify pending team payments"
            icon={Users}
            href="/admin/registrations"
            color="#22C55E"
            badge={pending > 0 ? `${pending} PENDING` : undefined}
          />
        </div>
      </div>

      {/* 4. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full">
        {/* Registration Growth Chart */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            border: "1px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: 0,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Registration Growth
              </h3>
              <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Last 7 days registration volume</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748B",
                  background: "#F8FAFC",
                  padding: "4px 10px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                }}
              >
                7D
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid #E2E8F0",
                  fontSize: 13,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={BLUE_ACCENT}
                strokeWidth={3}
                dot={{ fill: BLUE_ACCENT, r: 4 }}
                activeDot={{ r: 6 }}
                name="Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            border: "1px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0F172A",
                  margin: 0,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Revenue Trend (₹)
              </h3>
              <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Daily accumulated entry fee revenue</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#2563EB",
                  background: "rgba(37, 99, 235, 0.08)",
                  padding: "4px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                }}
              >
                ₹{revenue}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid #E2E8F0",
                  fontSize: 13,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Status Chart */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            border: "1px solid #E2E8F0",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: 16,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Team Status Ratio
          </h3>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i] }} />
                  <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Modern Recent Registrations Section */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          border: "1px solid #E2E8F0",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "Inter, sans-serif" }}>
              Recent Registrations
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
              Latest team signups and payment verifications
            </p>
          </div>
          <Link
            href="/admin/registrations"
            style={{
              fontSize: 13,
              color: "#2563EB",
              textDecoration: "none",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "Inter, sans-serif",
            }}
          >
            View all registrations <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 60, borderRadius: 16, background: "#F8FAFC" }} />
            ))}
          </div>
        ) : recentRegs.length === 0 ? (
          <p style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", padding: "30px 0", margin: 0 }}>
            No team registrations submitted yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentRegs.map((reg) => (
              <div
                key={reg.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: "1px solid #F1F5F9",
                  background: "#FFFFFF",
                  transition: "all 0.15s ease",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#FFFFFF";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#F1F5F9";
                }}
              >
                {/* Team Info */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "rgba(37, 99, 235, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#2563EB",
                      border: "1px solid rgba(37, 99, 235, 0.2)",
                      flexShrink: 0,
                    }}
                  >
                    {reg.teamName?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                      {reg.teamName || "—"}
                    </p>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                      Captain: {reg.captain?.name || reg.phone || "—"} • {reg.phone || ""}
                    </p>
                  </div>
                </div>

                {/* Status & Quick Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {reg.paymentScreenshotUrl && (
                    <button
                      onClick={() => setPreviewImg(reg.paymentScreenshotUrl)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        color: "#475569",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Eye size={14} color="#2563EB" /> Screenshot
                    </button>
                  )}
                  <StatusBadge status={reg.status || "pending"} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {reg.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(reg.id, "approved")}
                        title="Approve Team"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "#DCFCE7",
                          border: "none",
                          color: "#16A34A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {reg.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(reg.id, "rejected")}
                        title="Reject Team"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "#FEE2E2",
                          border: "none",
                          color: "#DC2626",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Danger Zone Section */}
      <div style={{ marginTop: 32 }}>
        <DangerZoneCard />
      </div>

      {previewImg && <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />}
    </div>
  );
}
