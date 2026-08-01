"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import {
  Users, Trophy, Wallet, CheckCircle, Clock, Swords, Zap, Plus, Bell,
  ChevronRight, Check, X, Eye, ArrowUpRight
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { QuickActionButton } from "@/components/admin/QuickActionButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DangerZoneCard } from "@/components/admin/DangerZoneCard";
import { ImageModal } from "@/components/admin/ImageModal";
import { SectionHeader, ChartCard, EmptyChartState } from "@/components/admin/DashboardWidgets";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Link from "next/link";
import toast from "react-hot-toast";

const BLUE = "#2563EB";
const PIE_COLORS = ["#F59E0B", "#10B981", "#EF4444"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

// ─── Summary Badge ─────────────────────────────────────────────────────────────
function SummaryBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 12,
        background: color + "12",
        border: `1px solid ${color}30`,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ─── Registration Row ───────────────────────────────────────────────────────────
function RegistrationRow({
  reg,
  onPreview,
  onApprove,
  onReject,
}: {
  reg: any;
  onPreview: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const initials = reg.teamName?.slice(0, 2).toUpperCase() || "??";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px solid #F3F4F6",
        background: "#FAFAFA",
        transition: "all 0.15s ease",
        gap: 12,
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#F3F4F6";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            color: BLUE,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>
            {reg.teamName || "—"}
          </p>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {reg.captain?.name || reg.phone || "—"} {reg.phone ? `• ${reg.phone}` : ""}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {reg.paymentScreenshotUrl && (
          <button
            onClick={onPreview}
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Eye size={13} color={BLUE} /> Screenshot
          </button>
        )}
        <StatusBadge status={reg.status || "pending"} />
        <div style={{ display: "flex", gap: 4 }}>
          {reg.status !== "approved" && (
            <button
              onClick={onApprove}
              title="Approve"
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "#DCFCE7", border: "none", color: "#15803D",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <Check size={14} />
            </button>
          )}
          {reg.status !== "rejected" && (
            <button
              onClick={onReject}
              title="Reject"
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "#FEE2E2", border: "none", color: "#B91C1C",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [recentRegs, setRecentRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    const unsubRegs = onSnapshot(collection(db, "registrations"), (snap) => {
      setRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
    return () => { unsubRegs(); unsubMatches(); unsubSettings(); unsubRecent(); };
  }, []);

  // ─── Derived values ─────────────────────────────────────────────────────────
  const approved = registrations.filter((r) => r.status === "approved").length;
  const pending = registrations.filter((r) => r.status === "pending").length;
  const rejected = registrations.filter((r) => r.status === "rejected").length;
  const total = registrations.length;
  const maxTeams = settings.maxTeams || 24;
  const prizePool = settings.prizePool || 1000;
  const entryFee = settings.entryFee || 100;
  const revenue = approved * entryFee;
  const liveMatches = matches.filter((m) => m.status === "live").length;
  const slotsLeft = maxTeams - total;

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "registrations", id), { status });
    toast.success(`Registration ${status}`);
  };

  // ─── Chart data ──────────────────────────────────────────────────────────────
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
  const hasGrowthData = growthData.some((d) => d.count > 0);
  const hasPieData = pieData.some((d) => d.value > 0);

  const TOOLTIP_STYLE = {
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>

      {/* ── 1. Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>Admin</span>
          <ChevronRight size={13} color="#D1D5DB" />
          <span style={{ fontSize: 13, color: BLUE, fontWeight: 600 }}>Dashboard</span>
          <span
            style={{
              marginLeft: 8,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "rgba(37,99,235,0.08)",
              color: BLUE,
              padding: "3px 10px",
              borderRadius: 20,
              border: "1px solid rgba(37,99,235,0.18)",
            }}
          >
            ESPORTS CONTROL CENTER
          </span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
              Tournament Control Center
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "6px 0 0", fontWeight: 500 }}>
              {getGreeting()}, Hamenath 👋 — Monitor registrations, payments, live matches and tournament operations from one place.
            </p>
            {/* Summary badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {pending > 0 && <SummaryBadge label="Pending Payments" value={pending} color="#F59E0B" />}
              {liveMatches > 0 && <SummaryBadge label="Live Matches" value={liveMatches} color="#EF4444" />}
              <SummaryBadge label="Remaining Slots" value={slotsLeft} color="#10B981" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/tournaments" style={{ textDecoration: "none" }}>
              <button
                style={{
                  height: 44, padding: "0 18px", borderRadius: 14,
                  background: "#FFFFFF", border: "1px solid #E5E7EB",
                  color: "#374151", fontWeight: 600, fontSize: 14,
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
                  transition: "all 0.2s ease", fontFamily: "Inter, sans-serif",
                }}
              >
                <Trophy size={15} color={BLUE} /> Rules
              </button>
            </Link>
            <Link href="/admin/matches" style={{ textDecoration: "none" }}>
              <button
                style={{
                  height: 44, padding: "0 18px", borderRadius: 14,
                  background: BLUE, border: "none", color: "#FFFFFF",
                  fontWeight: 600, fontSize: 14,
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                  transition: "all 0.2s ease", fontFamily: "Inter, sans-serif",
                }}
              >
                <Plus size={16} strokeWidth={2.5} /> Create Match
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards ─────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8 w-full"
      >
        <StatCard
          title="Registered Teams"
          value={total}
          description={`${slotsLeft} slots remaining`}
          icon={Users}
          iconColor={BLUE}
          iconBg="rgba(37,99,235,0.08)"
          trend={{ value: 12 }}
        />
        <StatCard
          title="Approved Squads"
          value={approved}
          description="Payment verified"
          icon={CheckCircle}
          iconColor="#10B981"
          iconBg="rgba(16,185,129,0.08)"
          trend={{ value: 8 }}
        />
        <StatCard
          title="Pending Payments"
          value={pending}
          description="Awaiting verification"
          icon={Clock}
          iconColor="#F59E0B"
          iconBg="rgba(245,158,11,0.08)"
        />
        <StatCard
          title="Prize Pool"
          value={`₹${prizePool.toLocaleString()}`}
          description="Total distribution"
          icon={Trophy}
          iconColor="#8B5CF6"
          iconBg="rgba(139,92,246,0.08)"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${revenue.toLocaleString()}`}
          description={`₹${entryFee} per team`}
          icon={Wallet}
          accent={true}
        />
        <StatCard
          title="Live Matches"
          value={liveMatches}
          description="Active lobbies"
          icon={Swords}
          iconColor="#EF4444"
          iconBg="rgba(239,68,68,0.08)"
        />
      </div>

      {/* ── 3. Quick Actions ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="Quick Actions" subtitle="Jump to key operations" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          <QuickActionButton
            label="Create Tournament"
            description="Format, slots & prize pool"
            icon={Trophy}
            href="/admin/tournaments"
            color={BLUE}
            badge="POPULAR"
          />
          <QuickActionButton
            label="Create Match"
            description="Schedule, room ID & password"
            icon={Swords}
            href="/admin/matches"
            color="#8B5CF6"
          />
          <QuickActionButton
            label="Publish Announcement"
            description="Broadcast to all players"
            icon={Bell}
            href="/admin/announcements"
            color="#F59E0B"
          />
          <QuickActionButton
            label="Approve Teams"
            description="Review pending payments"
            icon={Users}
            href="/admin/registrations"
            color="#10B981"
            badge={pending > 0 ? `${pending} PENDING` : undefined}
          />
        </div>
      </div>

      {/* ── 4. Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 w-full">
        {/* Registration Growth */}
        <ChartCard>
          <SectionHeader
            title="Registration Trend"
            subtitle="Last 7 days"
            action={
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", padding: "3px 10px", borderRadius: 8, border: "1px solid #E5E7EB" }}>
                7D
              </span>
            }
          />
          {hasGrowthData ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={growthData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="count" stroke={BLUE} strokeWidth={2.5} dot={{ fill: BLUE, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} name="Registrations" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState title="No registrations yet" message="Registrations will appear here once players start signing up." />
          )}
        </ChartCard>

        {/* Revenue Chart */}
        <ChartCard>
          <SectionHeader
            title="Revenue Trend"
            subtitle="Daily entry fee revenue"
            action={
              <span style={{ fontSize: 11, fontWeight: 600, color: BLUE, background: "rgba(37,99,235,0.08)", padding: "3px 10px", borderRadius: 8, border: "1px solid rgba(37,99,235,0.18)" }}>
                ₹{revenue.toLocaleString()}
              </span>
            }
          />
          {hasGrowthData ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${v}`, "Revenue"]} />
                <Bar dataKey="revenue" fill={BLUE} radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState title="No revenue yet" message="Revenue data will appear as teams get approved." />
          )}
        </ChartCard>

        {/* Team Status Pie */}
        <ChartCard>
          <SectionHeader title="Team Status" subtitle="Approval breakdown" />
          {hasPieData ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={66} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ ...TOOLTIP_STYLE, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 3, background: PIE_COLORS[i] }} />
                      <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyChartState title="No data yet" message="Team status breakdown will appear here once registrations are submitted." />
          )}
        </ChartCard>
      </div>

      {/* ── 5. Recent Registrations ───────────────────────────────────────────── */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          border: "1px solid #E5E7EB",
          padding: "20px",
          boxShadow: "0 1px 4px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.02)",
          marginBottom: 32,
        }}
      >
        <SectionHeader
          title="Recent Registrations"
          subtitle="Latest team signups and payment verifications"
          action={
            <Link href="/admin/registrations" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: BLUE, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
              View all <ArrowUpRight size={13} />
            </Link>
          }
        />

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{ height: 58, borderRadius: 12, background: "linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)", backgroundSize: "200% 100%", animation: "skeletonWave 1.5s infinite" }}
              />
            ))}
            <style>{`@keyframes skeletonWave { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>
        ) : recentRegs.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10 }}>
            <div style={{ fontSize: 36 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: 0 }}>No registrations yet</p>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, textAlign: "center", maxWidth: 280 }}>
              Start promoting your tournament to receive registrations.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentRegs.map((reg) => (
              <RegistrationRow
                key={reg.id}
                reg={reg}
                onPreview={() => setPreviewImg(reg.paymentScreenshotUrl)}
                onApprove={() => updateStatus(reg.id, "approved")}
                onReject={() => updateStatus(reg.id, "rejected")}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 6. Danger Zone ───────────────────────────────────────────────────── */}
      <div style={{ marginTop: 8 }}>
        <DangerZoneCard />
      </div>

      {previewImg && <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />}
    </div>
  );
}
