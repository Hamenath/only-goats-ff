"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection, onSnapshot, orderBy, query,
  doc, updateDoc, deleteDoc, getDoc, setDoc
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  LogOut, Users, Check, X, Trash2, Download,
  Search, Settings, Activity, Eye, ShieldCheck
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
  const [activeTab, setActiveTab] = useState<"registrations" | "settings">("registrations");
  const [settings, setSettings] = useState({ tournamentDate: "", registrationEnabled: true, registrationLimit: 24 });

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/admin");
    });
    return () => unsub();
  }, [router]);

  // Registrations
  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "tournament"), (snap) => {
      if (snap.exists()) setSettings(snap.data() as typeof settings);
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
        <div style={{ display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid #eaeaea" }}>
          {[{ id: "registrations", label: "Registrations List", icon: Users }, { id: "settings", label: "General Settings", icon: Settings }].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
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
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Tournament Date & Time</label>
                <input
                  type="datetime-local"
                  value={settings.tournamentDate?.replace("Z", "") || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, tournamentDate: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eaeaea", borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>Registration Team Limit</label>
                <input
                  type="number"
                  value={settings.registrationLimit}
                  onChange={(e) => setSettings((s) => ({ ...s, registrationLimit: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eaeaea", borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", border: "1.5px solid #eaeaea", borderRadius: 14, background: "#fafafa" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Lobby Submissions Status</p>
                  <p style={{ fontSize: 12, color: "#888" }}>Allow users to submit registration form</p>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: 48, height: 26, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.registrationEnabled}
                    onChange={(e) => setSettings((s) => ({ ...s, registrationEnabled: e.target.checked }))}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute", inset: 0, borderRadius: 100,
                    background: settings.registrationEnabled ? "#e50914" : "#eaeaea",
                    transition: "background 0.2s",
                  }} />
                  <span style={{
                    position: "absolute",
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    top: 3, left: settings.registrationEnabled ? 25 : 3,
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
      </div>
    </div>
  );
}
