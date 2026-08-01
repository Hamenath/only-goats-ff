"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Star,
  Radio,
  Upload,
  Search,
  Loader2,
  Layers,
  Lock,
  Eye,
  Archive,
} from "lucide-react";
import { Tournament } from "@/types/tournament";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

const DEFAULT_TOURNAMENT: Omit<Tournament, "id"> = {
  title: "Only Goats Free Fire Clash Squad Tournament",
  season: "Season 1",
  status: "upcoming",
  isFeatured: true,
  isActive: true,
  bannerUrl: "",
  posterUrl: "",
  description: "Official Free Fire Clash Squad 4v4 Championship.",
  maxTeams: 24,
  qualifierCount: 2,
  teamsPerQualifier: 12,
  teamsQualifiedPerQualifier: 6,
  premiumPassEnabled: true,
  premiumPassSlots: 4,
  premiumPassFee: 40,
  entryFee: 160,
  prizePool: "₹5,000",
  rules: "1. No Roof. 2. No Spray. 3. No Emote. 4. Face to Face Fight Only.",
  startDate: "2026-08-08T23:00",
  endDate: "2026-08-09T23:00",
  regCloseTime: "2026-08-08T20:00",
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Tournament, "id">>(DEFAULT_TOURNAMENT);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tournament));
      setTournaments(list);
      setLoading(false);
    });

    const unsubActive = onSnapshot(doc(db, "settings", "activeTournament"), (snap) => {
      if (snap.exists()) {
        setActiveTournamentId(snap.data().activeTournamentId || null);
      }
    });

    return () => {
      unsub();
      unsubActive();
    };
  }, []);

  const handleTeamsOrQualifiersChange = (field: "maxTeams" | "qualifierCount", val: number) => {
    setForm((prev) => {
      const maxT = field === "maxTeams" ? Math.max(2, val) : prev.maxTeams;
      const qualC = field === "qualifierCount" ? Math.max(1, val) : prev.qualifierCount;
      const tPerQ = Math.ceil(maxT / qualC);
      return {
        ...prev,
        maxTeams: maxT,
        qualifierCount: qualC,
        teamsPerQualifier: tPerQ,
      };
    });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, bannerUrl: data.url }));
        toast.success("Banner image uploaded!");
      }
    } catch {
      toast.error("Failed to upload banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "tournaments", editId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        toast.success("Tournament updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "tournaments"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        if (form.isActive) {
          await setDoc(doc(db, "settings", "activeTournament"), { activeTournamentId: docRef.id });
        }
        toast.success("New Tournament created successfully!");
      }
      setShowForm(false);
      setEditId(null);
      setForm(DEFAULT_TOURNAMENT);
    } catch (err: any) {
      toast.error(err.message || "Failed to save tournament");
    }
  };

  const handleSetActive = async (t: Tournament) => {
    try {
      const batch = writeBatch(db);
      tournaments.forEach((item) => {
        batch.update(doc(db, "tournaments", item.id), { isActive: item.id === t.id });
      });
      batch.set(doc(db, "settings", "activeTournament"), { activeTournamentId: t.id });
      await batch.commit();
      setActiveTournamentId(t.id);
      toast.success(`"${t.title}" is now the Active Public Tournament! 👑`);
    } catch {
      toast.error("Failed to set active tournament");
    }
  };

  const handleClone = async (t: Tournament) => {
    try {
      const { id, ...rest } = t;
      await addDoc(collection(db, "tournaments"), {
        ...rest,
        title: `${t.title} (Copy)`,
        season: `${t.season} - New`,
        status: "draft",
        isActive: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Tournament cloned as new Draft!");
    } catch {
      toast.error("Failed to clone tournament");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tournaments", id));
      setConfirmDeleteId(null);
      toast.success("Tournament deleted");
    } catch {
      toast.error("Failed to delete tournament");
    }
  };

  const startEdit = (t: Tournament) => {
    setForm({
      title: t.title || "",
      season: t.season || "",
      status: t.status || "upcoming",
      isFeatured: t.isFeatured ?? true,
      isActive: t.isActive ?? false,
      bannerUrl: t.bannerUrl || "",
      posterUrl: t.posterUrl || "",
      description: t.description || "",
      maxTeams: t.maxTeams || 24,
      qualifierCount: t.qualifierCount || 2,
      teamsPerQualifier: t.teamsPerQualifier || 12,
      teamsQualifiedPerQualifier: t.teamsQualifiedPerQualifier || 6,
      premiumPassEnabled: t.premiumPassEnabled ?? true,
      premiumPassSlots: t.premiumPassSlots || 4,
      premiumPassFee: t.premiumPassFee || 40,
      entryFee: t.entryFee || 160,
      prizePool: t.prizePool || "₹5,000",
      rules: t.rules || "",
      startDate: t.startDate || "",
      endDate: t.endDate || "",
      regCloseTime: t.regCloseTime || "",
    });
    setEditId(t.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inpStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    fontSize: 13,
    color: "#F8FAFC",
    outline: "none",
    background: "#0F172A",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 900, color: "#F8FAFC", fontFamily: "Space Grotesk, sans-serif" }}>
            🏆 Tournament Management Hub
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Create, configure, clone, and host esports tournaments dynamically.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm(DEFAULT_TOURNAMENT);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "#2563EB",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 0 16px rgba(37, 99, 235, 0.4)",
          }}
        >
          <Plus size={16} /> {showForm ? "Close Form" : "Create Tournament"}
        </button>
      </div>

      {/* Form Drawer / Modal */}
      {showForm && (
        <div style={{ background: "#111827", borderRadius: 20, border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, marginBottom: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#F8FAFC", marginBottom: 20 }}>
            {editId ? "✏️ Edit Tournament Configuration" : "➕ Create New Esports Tournament"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>TOURNAMENT TITLE *</label>
                <input type="text" required placeholder="Only Goats Free Fire Championship" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>SEASON *</label>
                <input type="text" required placeholder="Season 1" value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>STATUS</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} style={inpStyle}>
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">🔴 Live</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>MAXIMUM TEAMS *</label>
                <input type="number" min={4} value={form.maxTeams} onChange={(e) => handleTeamsOrQualifiersChange("maxTeams", parseInt(e.target.value) || 24)} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>NUMBER OF QUALIFIERS *</label>
                <input type="number" min={1} value={form.qualifierCount} onChange={(e) => handleTeamsOrQualifiersChange("qualifierCount", parseInt(e.target.value) || 2)} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#38BDF8", marginBottom: 6 }}>TEAMS PER QUALIFIER</label>
                <input type="number" readOnly value={form.teamsPerQualifier} style={{ ...inpStyle, background: "#0F172A", fontWeight: 800, color: "#38BDF8" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>PRIZE POOL</label>
                <input type="text" value={form.prizePool} onChange={(e) => setForm((f) => ({ ...f, prizePool: e.target.value }))} style={inpStyle} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.1)", background: "#0F172A", color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>Cancel</button>
              <button type="submit" style={{ padding: "10px 24px", borderRadius: 10, background: "#2563EB", color: "#FFF", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>{editId ? "Save Tournament" : "Create Tournament"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Tournaments List Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ height: 200, borderRadius: 20, background: "#111827" }} />)}
        </div>
      ) : tournaments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#111827", borderRadius: 20, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <Trophy size={40} style={{ color: "#64748B", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>No tournaments created yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {tournaments.map((t) => {
            const isActive = activeTournamentId === t.id || t.isActive;

            return (
              <div
                key={t.id}
                style={{
                  background: "#111827",
                  borderRadius: 20,
                  border: isActive ? "2px solid #2563EB" : "1px solid rgba(255, 255, 255, 0.08)",
                  overflow: "hidden",
                  boxShadow: isActive ? "0 10px 30px rgba(37, 99, 235, 0.3)" : "0 10px 25px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {t.bannerUrl && (
                  <div style={{ height: 120, width: "100%", overflow: "hidden", background: "#0F172A" }}>
                    <img src={t.bannerUrl} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}

                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#38BDF8", textTransform: "uppercase" }}>{t.season}</span>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#F8FAFC", marginTop: 2 }}>{t.title}</h3>
                      </div>
                      {isActive && (
                        <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(37, 99, 235, 0.2)", color: "#38BDF8", fontSize: 11, fontWeight: 800, border: "1px solid #2563EB" }}>
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div style={{ background: "#0F172A", borderRadius: 14, padding: 14, marginBottom: 16, fontSize: 12, color: "#94A3B8" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>Max Teams: <strong style={{ color: "#F8FAFC" }}>{t.maxTeams}</strong></div>
                        <div>Qualifiers: <strong style={{ color: "#F8FAFC" }}>{t.qualifierCount}</strong></div>
                        <div>Prize Pool: <strong style={{ color: "#F8FAFC" }}>{t.prizePool}</strong></div>
                        <div>Status: <strong style={{ color: "#38BDF8", textTransform: "capitalize" }}>{t.status}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Stack */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleSetActive(t)}
                      disabled={isActive}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: isActive ? "#2563EB" : "#0F172A",
                        color: isActive ? "#FFF" : "#94A3B8",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: isActive ? "default" : "pointer",
                      }}
                    >
                      {isActive ? "Active Tournament" : "Set Active"}
                    </button>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleClone(t)} title="Clone Tournament" style={{ padding: 8, borderRadius: 8, background: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#94A3B8", cursor: "pointer" }}>
                        <Layers size={15} />
                      </button>
                      <button onClick={() => startEdit(t)} title="Edit Tournament" style={{ padding: 8, borderRadius: 8, background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", border: "none", cursor: "pointer" }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(t.id)} title="Delete Tournament" style={{ padding: 8, borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", color: "#F87171", border: "none", cursor: "pointer" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Tournament"
          message="Are you sure you want to delete this tournament instance? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
