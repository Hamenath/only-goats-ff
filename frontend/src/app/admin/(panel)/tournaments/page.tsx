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

  // Real-time Subscription to Tournaments and Active Settings
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

  // Calculate Teams Per Qualifier dynamically when Max Teams or Qualifier Count changes
  const handleTeamsOrQualifiersChange = (field: "maxTeams" | "qualifierCount", val: number) => {
    setForm((prev) => {
      const maxT = field === "maxTeams" ? Math.max(2, val) : prev.maxTeams;
      const qualC = field === "qualifierCount" ? Math.max(1, val) : prev.qualifierCount;
      const perQual = Math.ceil(maxT / qualC);
      return {
        ...prev,
        maxTeams: maxT,
        qualifierCount: qualC,
        teamsPerQualifier: perQual,
      };
    });
  };

  // Image Upload Handler
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
        setForm((prev) => ({ ...prev, bannerUrl: data.url }));
        toast.success("Banner uploaded!");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingBanner(false);
    }
  };

  // Submit Handler (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "tournaments", editId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        toast.success("Tournament updated!");
      } else {
        const newDoc = await addDoc(collection(db, "tournaments"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Set active pointer if first tournament
        if (tournaments.length === 0) {
          await setDoc(doc(db, "settings", "activeTournament"), {
            activeTournamentId: newDoc.id,
            updatedAt: serverTimestamp(),
          });
        }
        toast.success("New tournament created!");
      }

      // Add audit log
      await addDoc(collection(db, "logs"), {
        adminName: "Admin",
        action: editId ? "Updated Tournament" : "Created Tournament",
        details: `Saved tournament ${form.title} (${form.season})`,
        createdAt: serverTimestamp(),
      });

      setForm(DEFAULT_TOURNAMENT);
      setEditId(null);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save tournament");
    }
  };

  // Set Active Tournament Pointer
  const handleSetActive = async (t: Tournament) => {
    try {
      const batch = writeBatch(db);
      tournaments.forEach((item) => {
        batch.update(doc(db, "tournaments", item.id), { isActive: item.id === t.id });
      });
      batch.set(
        doc(db, "settings", "activeTournament"),
        { activeTournamentId: t.id, updatedAt: serverTimestamp() },
        { merge: true }
      );
      await batch.commit();

      // Add Audit Log
      await addDoc(collection(db, "logs"), {
        adminName: "Admin",
        action: "Set Active Tournament",
        details: `Set ${t.title} (${t.season}) as active public tournament.`,
        createdAt: serverTimestamp(),
      });

      toast.success(`Active tournament switched to "${t.title}" (${t.season})! 🚀`);
    } catch {
      toast.error("Failed to switch active tournament");
    }
  };

  // Clone Tournament Handler
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

  // Delete Tournament Handler
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tournaments", id));
      setConfirmDeleteId(null);
      toast.success("Tournament deleted");
    } catch {
      toast.error("Failed to delete tournament");
    }
  };

  // Edit Mode Start
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
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    background: "#FAFAFA",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>
            🏆 Tournament Management Hub
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Create, configure, clone, and host unlimited esports tournaments dynamically from Admin.
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
            background: "#DC2626",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(220,38,38,0.2)",
          }}
        >
          <Plus size={16} /> {showForm ? "Close Form" : "Create Tournament"}
        </button>
      </div>

      {/* Form Drawer / Modal */}
      {showForm && (
        <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24, marginBottom: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>
            {editId ? "✏️ Edit Tournament Configuration" : "➕ Create New Esports Tournament"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>TOURNAMENT TITLE *</label>
                <input type="text" required placeholder="Only Goats Free Fire Championship" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>SEASON *</label>
                <input type="text" required placeholder="Season 1" value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>STATUS</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} style={inpStyle}>
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">🔴 Live</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAXIMUM TEAMS *</label>
                <input type="number" min={4} value={form.maxTeams} onChange={(e) => handleTeamsOrQualifiersChange("maxTeams", parseInt(e.target.value) || 24)} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>NUMBER OF QUALIFIERS *</label>
                <input type="number" min={1} value={form.qualifierCount} onChange={(e) => handleTeamsOrQualifiersChange("qualifierCount", parseInt(e.target.value) || 2)} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#DC2626", marginBottom: 6 }}>DYNAMIC TEAMS PER QUALIFIER</label>
                <input type="number" readOnly value={form.teamsPerQualifier} style={{ ...inpStyle, background: "#FEF2F2", fontWeight: 800, color: "#DC2626" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>QUALIFIED TEAMS PER QUALIFIER</label>
                <input type="number" min={1} value={form.teamsQualifiedPerQualifier} onChange={(e) => setForm((f) => ({ ...f, teamsQualifiedPerQualifier: parseInt(e.target.value) || 6 }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>PREMIUM PASS FEE (₹)</label>
                <input type="number" value={form.premiumPassFee} onChange={(e) => setForm((f) => ({ ...f, premiumPassFee: parseInt(e.target.value) || 40 }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>PREMIUM PASS SLOTS</label>
                <input type="number" value={form.premiumPassSlots} onChange={(e) => setForm((f) => ({ ...f, premiumPassSlots: parseInt(e.target.value) || 4 }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>ENTRY FEE (₹)</label>
                <input type="number" value={form.entryFee} onChange={(e) => setForm((f) => ({ ...f, entryFee: parseInt(e.target.value) || 160 }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>PRIZE POOL</label>
                <input type="text" value={form.prizePool} onChange={(e) => setForm((f) => ({ ...f, prizePool: e.target.value }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>BANNER IMAGE</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#F1F5F9", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {uploadingBanner ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                    {uploadingBanner ? "Uploading..." : "Upload Banner"}
                    <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: "none" }} />
                  </label>
                  {form.bannerUrl && <a href={form.bannerUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#2563EB" }}>Preview</a>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", fontSize: 13, fontWeight: 600 }}>Cancel</button>
              <button type="submit" style={{ padding: "9px 24px", borderRadius: 8, background: "#DC2626", color: "#FFF", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{editId ? "Save Tournament" : "Create Tournament"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Tournaments Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ height: 200, borderRadius: 16, background: "#F1F5F9" }} />)}
        </div>
      ) : tournaments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Trophy size={40} style={{ color: "#94A3B8", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>No tournaments created yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
          {tournaments.map((t) => {
            const isActive = activeTournamentId === t.id || t.isActive;

            return (
              <div
                key={t.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  border: isActive ? "2px solid #DC2626" : "1px solid #E2E8F0",
                  overflow: "hidden",
                  boxShadow: isActive ? "0 10px 30px rgba(220,38,38,0.12)" : "0 4px 14px rgba(0,0,0,0.03)",
                }}
              >
                {t.bannerUrl && (
                  <div style={{ height: 110, width: "100%", overflow: "hidden", background: "#0F172A" }}>
                    <img src={t.bannerUrl} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}

                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>{t.season}</span>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{t.title}</h3>
                    </div>
                    {isActive && (
                      <span style={{ padding: "4px 8px", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 10, fontWeight: 800, border: "1px solid #FECACA" }}>
                        ACTIVE PUBLIC
                      </span>
                    )}
                  </div>

                  <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: "#475569" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>Max Teams: <strong>{t.maxTeams}</strong></div>
                      <div>Qualifiers: <strong>{t.qualifierCount} ({t.teamsPerQualifier}/qual)</strong></div>
                      <div>Prize Pool: <strong>{t.prizePool}</strong></div>
                      <div>Status: <strong style={{ textTransform: "capitalize" }}>{t.status}</strong></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      onClick={() => handleSetActive(t)}
                      disabled={isActive}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: isActive ? "#DC2626" : "#F1F5F9",
                        color: isActive ? "#FFF" : "#475569",
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: isActive ? "default" : "pointer",
                      }}
                    >
                      {isActive ? "Active Tournament" : "Set Active"}
                    </button>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleClone(t)} title="Clone Tournament" style={{ padding: 6, borderRadius: 6, background: "#F1F5F9", border: "none", cursor: "pointer" }}>
                        <Layers size={14} />
                      </button>
                      <button onClick={() => startEdit(t)} title="Edit Tournament" style={{ padding: 6, borderRadius: 6, background: "#E0F2FE", color: "#0284C7", border: "none", cursor: "pointer" }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(t.id)} title="Delete Tournament" style={{ padding: 6, borderRadius: 6, background: "#FEE2E2", color: "#DC2626", border: "none", cursor: "pointer" }}>
                        <Trash2 size={14} />
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
