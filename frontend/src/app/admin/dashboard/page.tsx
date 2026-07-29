"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection, onSnapshot, orderBy, query,
  doc, updateDoc, deleteDoc, getDoc, setDoc, addDoc
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  LogOut, Users, Check, X, Trash2, Download,
  Search, Settings, Activity, Eye, ShieldCheck,
  Calendar, Bell, Plus
} from "lucide-react";

interface Registration {
  id: string;
  teamId: string;
  teamName: string;
  captain: { name: string; uid: string; gameName: string };
  phone: string;
  whatsapp: string;
  status: "pending" | "approved" | "rejected";
  createdAt: { seconds: number } | null;
  upiTransactionId: string;
  paymentScreenshotUrl: string;
}

const STATUS_COLORS = {
  pending: { bg: "rgba(255,170,0,0.06)", color: "#cc8800", border: "rgba(255,170,0,0.15)" },
  approved: { bg: "rgba(34,197,94,0.06)", color: "#16a34a", border: "rgba(34,197,94,0.15)" },
  rejected: { bg: "rgba(229,9,20,0.06)", color: "#e50914", border: "rgba(229,9,20,0.12)" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [activeTab, setActiveTab] = useState<"registrations" | "settings" | "announcements" | "schedule">("registrations");
  
  // Settings State matching Phase 5 Schema
  const [settings, setSettings] = useState({
    countdownDate: "",
    registrationOpen: true,
    maxTeams: 24,
    prizePool: 1000,
    entryFee: 100,
    reEntryFee: 40,
    registeredTeams: 0
  });

  // Announcements State (Phase 14)
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annPriority, setAnnPriority] = useState("high");

  // Match Schedule State (Phase 11 & Phase 13)
  const [matches, setMatches] = useState<any[]>([]);
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [matchName, setMatchName] = useState("");
  const [matchStage, setMatchStage] = useState("Stage 1");
  const [matchStatus, setMatchStatus] = useState<"upcoming" | "live" | "completed">("upcoming");
  const [matchT1, setMatchT1] = useState("12 SQUADS");
  const [matchT2, setMatchT2] = useState("");
  const [matchStreamUrl, setMatchStreamUrl] = useState("");

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/admin");
    });
    return () => unsub();
  }, [router]);

  // Registrations Realtime List
  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Settings Realtime Listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "tournament"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings({
          countdownDate: data.countdownDate || "",
          registrationOpen: data.registrationOpen !== undefined ? data.registrationOpen : true,
          maxTeams: data.maxTeams !== undefined ? data.maxTeams : 24,
          prizePool: data.prizePool !== undefined ? data.prizePool : 1000,
          entryFee: data.entryFee !== undefined ? data.entryFee : 100,
          reEntryFee: data.reEntryFee !== undefined ? data.reEntryFee : 40,
          registeredTeams: data.registeredTeams !== undefined ? data.registeredTeams : 0
        });
      }
    });
    return () => unsub();
  }, []);

  // Announcements Realtime Listener
  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Matches Schedule Realtime Listener
  useEffect(() => {
    const q = query(collection(db, "schedule"), orderBy("date"));
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "registrations", id), { status });
      toast.success(`Registration ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    try {
      await deleteDoc(doc(db, "registrations", id));
      toast.success("Registration deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "tournament"), settings, { merge: true });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annDesc.trim()) return;
    try {
      await addDoc(collection(db, "announcements"), {
        title: annTitle,
        description: annDesc,
        priority: annPriority,
        createdAt: new Date().toISOString()
      });
      setAnnTitle("");
      setAnnDesc("");
      toast.success("Announcement posted!");
    } catch {
      toast.error("Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      toast.success("Announcement deleted");
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchDate.trim() || !matchTime.trim() || !matchName.trim()) return;
    try {
      await addDoc(collection(db, "schedule"), {
        date: matchDate,
        time: matchTime,
        match: matchName,
        stage: matchStage,
        status: matchStatus,
        teams: {
          t1: matchT1,
          t2: matchT2 || undefined
        },
        streamUrl: matchStreamUrl || undefined
      });
      setMatchDate("");
      setMatchTime("");
      setMatchName("");
      setMatchT2("");
      setMatchStreamUrl("");
      toast.success("Match scheduled!");
    } catch {
      toast.error("Failed to schedule match");
    }
  };

  const handleUpdateMatchStatus = async (id: string, status: "upcoming" | "live" | "completed") => {
    try {
      await updateDoc(doc(db, "schedule", id), { status });
      toast.success(`Match updated to ${status}`);
    } catch {
      toast.error("Failed to update match status");
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Delete this scheduled match?")) return;
    try {
      await deleteDoc(doc(db, "schedule", id));
      toast.success("Match deleted");
    } catch {
      toast.error("Failed to delete match");
    }
  };

  const exportCSV = () => {
    const headers = ["Team ID", "Team Name", "Captain", "Phone", "WhatsApp", "UPI", "Status", "Date"];
    const rows = filteredRegs.map((r) => [
      r.teamId, r.teamName, r.captain.name, r.phone, r.whatsapp,
      r.upiTransactionId, r.status,
      r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "N/A",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${Date.now()}.csv`;
    a.click();
  };

  const filteredRegs = registrations.filter((r) => {
    const matchesSearch = r.teamName.toLowerCase().includes(search.toLowerCase()) ||
      r.captain.name.toLowerCase().includes(search.toLowerCase()) ||
      r.teamId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eaeaea", padding: "20px 0", position: "sticky", top: 72, zIndex: 100 }}>
        <div className="container-custom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 24, fontWeight: 800, color: "#111" }}>Admin Dashboard</h1>
            <p style={{ fontSize: 13, color: "#999" }}>Only Goats FF — Tournament Control Panel</p>
          </div>
          <button
            onClick={() => signOut(auth).then(() => router.push("/admin"))}
            className="btn-ghost"
            style={{ padding: "8px 20px", fontSize: 13 }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <div className="container-custom" style={{ padding: "40px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Total Squads", value: stats.total, icon: Users, color: "#111", desc: "Total applications" },
            { label: "Pending", value: stats.pending, icon: Activity, color: "#cc8800", desc: "Awaiting verification" },
            { label: "Approved Slots", value: stats.approved, icon: ShieldCheck, color: "#16a34a", desc: "Active in lobby" },
            { label: "Rejected Applications", value: stats.rejected, icon: X, color: "#e50914", desc: "Disqualified squads" },
          ].map(({ label, value, icon: Icon, color, desc }) => (
            <div key={label} className="glass-card" style={{ padding: "24px", border: "1px solid #eaeaea", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                <Icon size={16} style={{ color }} />
              </div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 32, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
              <p style={{ fontSize: 11, color: "#999" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Tabs selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid #eaeaea", flexWrap: "wrap" }}>
          {[
            { id: "registrations", label: "Registrations List", icon: Users },
            { id: "settings", label: "General Settings", icon: Settings },
            { id: "announcements", label: "Announcements", icon: Bell },
            { id: "schedule", label: "Match Schedule", icon: Calendar }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                padding: "14px 20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                color: activeTab === id ? "#111" : "#999",
                borderBottom: activeTab === id ? "2px solid #e50914" : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Registrations Tab */}
        {activeTab === "registrations" && (
          <div>
            {/* Controls bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                <input
                  type="text"
                  placeholder="Search by team name, captain name, or team ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 38px",
                    border: "1px solid #eaeaea",
                    borderRadius: 12,
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    background: "#fff",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "10px 16px",
                      border: "1px solid",
                      borderColor: filter === f ? "#111" : "#eaeaea",
                      background: filter === f ? "#111" : "#fff",
                      color: filter === f ? "#fff" : "#666",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      transition: "all 0.15s",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={exportCSV} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13, borderRadius: 10 }}>
                <Download size={14} /> Export CSV
              </button>
            </div>

            {/* Main Table view */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>Loading registrations database...</div>
            ) : filteredRegs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", border: "2px dashed #eaeaea", borderRadius: 20, background: "#fff" }}>
                <Users size={36} style={{ color: "#ccc", margin: "0 auto 16px" }} />
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 6 }}>No Applications</h3>
                <p style={{ color: "#999", fontSize: 14 }}>Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div style={{ border: "1px solid #eaeaea", borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                    <thead>
                      <tr style={{ background: "#fafafa", borderBottom: "1.5px solid #eaeaea" }}>
                        {["Team ID", "Team Name", "Captain Details", "Contact", "UPI Transaction ID", "Status", "Date Applied", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegs.map((reg, i) => {
                        const s = STATUS_COLORS[reg.status];
                        return (
                          <tr key={reg.id} style={{ borderBottom: i < filteredRegs.length - 1 ? "1px solid #f2f2f2" : "none" }}>
                            {/* ID */}
                            <td style={{ padding: "18px 20px", fontSize: 12, fontFamily: "monospace", color: "#e50914", fontWeight: 700 }}>{reg.teamId}</td>
                            {/* Name */}
                            <td style={{ padding: "18px 20px", fontSize: 14, fontWeight: 700, color: "#111" }}>{reg.teamName}</td>
                            {/* Captain details */}
                            <td style={{ padding: "18px 20px" }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#111", display: "block" }}>{reg.captain?.name}</span>
                              <span style={{ fontSize: 11, color: "#888", display: "block" }}>UID: {reg.captain?.uid} | IGN: {reg.captain?.gameName}</span>
                            </td>
                            {/* Contact */}
                            <td style={{ padding: "18px 20px" }}>
                              <span style={{ fontSize: 13, color: "#333", display: "block" }}>{reg.phone}</span>
                              <span style={{ fontSize: 11, color: "#888", display: "block" }}>WA: {reg.whatsapp}</span>
                            </td>
                            {/* Transaction */}
                            <td style={{ padding: "18px 20px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>{reg.upiTransactionId}</span>
                                <a href={reg.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" title="View Payment Screenshot"
                                  style={{
                                    width: 24, height: 24, borderRadius: 6, border: "1px solid #eaeaea", background: "#fafafa",
                                    display: "inline-flex", alignItems: "center", color: "#666", cursor: "pointer",
                                    justifyContent: "center"
                                  }}>
                                  <Eye size={12} />
                                </a>
                              </div>
                            </td>
                            {/* Status */}
                            <td style={{ padding: "18px 20px" }}>
                              <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {reg.status}
                              </span>
                            </td>
                            {/* Date */}
                            <td style={{ padding: "18px 20px", fontSize: 12, color: "#999", fontWeight: 500 }}>
                              {reg.createdAt ? new Date(reg.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}
                            </td>
                            {/* Actions */}
                            <td style={{ padding: "18px 20px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => handleStatus(reg.id, "approved")} title="Approve squad registration"
                                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Check size={14} style={{ color: "#16a34a" }} />
                                </button>
                                <button onClick={() => handleStatus(reg.id, "rejected")} title="Reject squad registration"
                                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(229,9,20,0.2)", background: "rgba(229,9,20,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <X size={14} style={{ color: "#e50914" }} />
                                </button>
                                <button onClick={() => handleDelete(reg.id)} title="Delete record permanently"
                                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #eaeaea", background: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Trash2 size={14} style={{ color: "#999" }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="glass-card" style={{ padding: 40, maxWidth: 600, border: "1px solid #eaeaea", background: "#fff", borderRadius: 20 }}>
            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 28, color: "#111" }}>Tournament Configuration</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Tournament Date & Time (Countdown)</label>
                <input
                  type="datetime-local"
                  value={settings.countdownDate?.replace("Z", "") || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, countdownDate: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eaeaea", borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Max Teams</label>
                <input
                  type="number"
                  value={settings.maxTeams}
                  onChange={(e) => setSettings((s) => ({ ...s, maxTeams: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eaeaea", borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Prize Pool (₹)</label>
                <input
                  type="number"
                  value={settings.prizePool}
                  onChange={(e) => setSettings((s) => ({ ...s, prizePool: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eaeaea", borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.entryFee}
                    onChange={(e) => setSettings((s) => ({ ...s, entryFee: Number(e.target.value) }))}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eaeaea", borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Re-Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.reEntryFee}
                    onChange={(e) => setSettings((s) => ({ ...s, reEntryFee: Number(e.target.value) }))}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eaeaea", borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", border: "1.5px solid #eaeaea", borderRadius: 14, background: "#fafafa" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Registration Open Status</p>
                  <p style={{ fontSize: 12, color: "#888" }}>Allow users to submit registration form</p>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: 48, height: 26, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.registrationOpen}
                    onChange={(e) => setSettings((s) => ({ ...s, registrationOpen: e.target.checked }))}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute", inset: 0, borderRadius: 100,
                    background: settings.registrationOpen ? "#e50914" : "#eaeaea",
                    transition: "background 0.2s",
                  }} />
                  <span style={{
                    position: "absolute",
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    top: 3, left: settings.registrationOpen ? 25 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  }} />
                </label>
              </div>
              <button onClick={handleSaveSettings} className="btn-accent" style={{ width: "100%", justifyContent: "center", padding: "14px 24px", borderRadius: 12 }}>
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
            {/* Create form */}
            <div className="glass-card" style={{ padding: 32, background: "#fff", border: "1px solid #eaeaea", borderRadius: 20, height: "fit-content" }}>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Post Announcement</h2>
              <form onSubmit={handleAddAnnouncement} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Title</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Registration Open"
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Description</label>
                  <textarea
                    value={annDesc}
                    onChange={(e) => setAnnDesc(e.target.value)}
                    placeholder="e.g. 24 Teams Only"
                    required
                    rows={4}
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13, resize: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button type="submit" className="btn-accent" style={{ justifyContent: "center", padding: "12px", borderRadius: 10 }}>
                  <Plus size={16} /> Post announcement
                </button>
              </form>
            </div>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700 }}>Active Announcements</h2>
              {announcements.length === 0 ? (
                <p style={{ fontSize: 13, color: "#999" }}>No announcements posted yet.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="glass-card" style={{ padding: 24, background: "#fff", border: "1px solid #eaeaea", borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 800, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4,
                          background: ann.priority === "high" ? "rgba(229,9,20,0.08)" : ann.priority === "medium" ? "rgba(255,170,0,0.08)" : "#f0f0f0",
                          color: ann.priority === "high" ? "#e50914" : ann.priority === "medium" ? "#cc8800" : "#666"
                        }}>{ann.priority} priority</span>
                        <span style={{ fontSize: 11, color: "#999" }}>{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{ann.title}</h3>
                      <p style={{ fontSize: 13, color: "#666" }}>{ann.description}</p>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} style={{ background: "none", border: "none", color: "#e50914", cursor: "pointer", padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Match Schedule Tab */}
        {activeTab === "schedule" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
            {/* Create form */}
            <div className="glass-card" style={{ padding: 32, background: "#fff", border: "1px solid #eaeaea", borderRadius: 20, height: "fit-content" }}>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Schedule New Match</h2>
              <form onSubmit={handleAddMatch} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Date (e.g. 15 Aug)</label>
                    <input
                      type="text"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      placeholder="Date text"
                      required
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Time (e.g. 7:00 PM)</label>
                    <input
                      type="text"
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      placeholder="Time text"
                      required
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Match Name</label>
                  <input
                    type="text"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    placeholder="e.g. Qualifier Match 1 — Bermuda"
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Stage (e.g. Stage 1)</label>
                    <input
                      type="text"
                      value={matchStage}
                      onChange={(e) => setMatchStage(e.target.value)}
                      placeholder="Stage"
                      required
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Status</label>
                    <select
                      value={matchStatus}
                      onChange={(e) => setMatchStatus(e.target.value as any)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">🔴 Live</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Team 1 (Default: 12 SQUADS)</label>
                    <input
                      type="text"
                      value={matchT1}
                      onChange={(e) => setMatchT1(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Team 2 (Optional for VS matchups)</label>
                    <input
                      type="text"
                      value={matchT2}
                      onChange={(e) => setMatchT2(e.target.value)}
                      placeholder="Leave blank for lobbies"
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 6 }}>Stream Link (Optional)</label>
                  <input
                    type="url"
                    value={matchStreamUrl}
                    onChange={(e) => setMatchStreamUrl(e.target.value)}
                    placeholder="https://youtube.com/live/..."
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #eaeaea", borderRadius: 10, fontSize: 13 }}
                  />
                </div>
                <button type="submit" className="btn-accent" style={{ justifyContent: "center", padding: "12px", borderRadius: 10 }}>
                  <Plus size={16} /> Add Match
                </button>
              </form>
            </div>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 700 }}>Scheduled Matches</h2>
              {matches.length === 0 ? (
                <p style={{ fontSize: 13, color: "#999" }}>No matches scheduled yet.</p>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="glass-card" style={{ padding: 24, background: "#fff", border: "1px solid #eaeaea", borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: "#f0f0f0", padding: "2px 8px", borderRadius: 4 }}>{match.stage}</span>
                        <span style={{ fontSize: 11, color: "#999" }}>{match.date} | {match.time}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{match.match}</h3>
                      <p style={{ fontSize: 12, color: "#666" }}>
                        {match.teams?.t2 ? `${match.teams.t1} VS ${match.teams.t2}` : match.teams?.t1 || "12 SQUADS"}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <select
                        value={match.status}
                        onChange={(e) => handleUpdateMatchStatus(match.id, e.target.value as any)}
                        style={{ padding: "6px 10px", fontSize: 11, fontWeight: 700, borderRadius: 8, border: "1px solid #eaeaea", background: "#fafafa" }}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="live">🔴 Live</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button onClick={() => handleDeleteMatch(match.id)} style={{ background: "none", border: "none", color: "#e50914", cursor: "pointer", padding: 4 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
