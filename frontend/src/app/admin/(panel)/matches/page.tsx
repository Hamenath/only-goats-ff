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
  serverTimestamp,
  writeBatch,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  Swords,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  Shield,
  Loader2,
  XCircle,
  Layers,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Image as ImageIcon,
  Send,
  Calendar,
  Sparkles,
  AlertCircle,
  Save,
  Trophy,
  ArrowRight,
  Zap,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Tournament } from "@/types/tournament";
import toast from "react-hot-toast";

interface MatchItem {
  id: string;
  name: string;
  map: string;
  round: string;
  matchTime: string;
  matchStartTime?: string;
  roomRevealTime?: string;
  regCloseTime?: string;
  maxSquads: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  isPublished: boolean;
  isArchived?: boolean;
  bannerUrl?: string;
  roomId?: string;
  roomPassword?: string;
  streamUrl?: string;
  whatsappUrl?: string;
  rules?: string;
  description?: string;
  orderIndex?: number;
  createdAt?: any;
}

const DEFAULT_FORM: Omit<MatchItem, "id"> = {
  name: "Qualifier 1",
  map: "Bermuda",
  round: "Qualifier 1",
  matchTime: "",
  matchStartTime: "",
  roomRevealTime: "",
  regCloseTime: "",
  maxSquads: 12,
  status: "upcoming",
  isPublished: true,
  isArchived: false,
  bannerUrl: "",
  roomId: "",
  roomPassword: "",
  streamUrl: "",
  whatsappUrl: "",
  rules: "1. No Roof. 2. No Spray. 3. No Emote. 4. Face to Face Fight Only.",
  description: "Official Tournament Stage Match.",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [teamCount, setTeamCount] = useState(0);

  // Modal Configure State
  const [configMatch, setConfigMatch] = useState<MatchItem | null>(null);
  const [form, setForm] = useState<Omit<MatchItem, "id">>(DEFAULT_FORM);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [generatingStages, setGeneratingStages] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 1. Fetch Active Tournament and Real-time Matches
  useEffect(() => {
    // Fetch active tournament pointer
    const unsubActive = onSnapshot(doc(db, "settings", "activeTournament"), (docSnap) => {
      if (docSnap.exists()) {
        const activeId = docSnap.data().activeTournamentId;
        if (activeId) {
          onSnapshot(doc(db, "tournaments", activeId), (tSnap) => {
            if (tSnap.exists()) {
              setActiveTournament({ id: tSnap.id, ...tSnap.data() } as Tournament);
            }
          });
        }
      }
    });

    // Fetch team registration count
    const unsubRegs = onSnapshot(collection(db, "registrations"), (snap) => {
      setTeamCount(snap.docs.length);
    });

    // Fetch matches
    const qMatches = query(collection(db, "matches"), orderBy("createdAt", "asc"));
    const unsubMatches = onSnapshot(qMatches, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchItem));
      setMatches(data);
      setLoading(false);
    });

    return () => {
      unsubActive();
      unsubRegs();
      unsubMatches();
    };
  }, []);

  // Auto Generate Stages Function
  const handleAutoGenerateStages = async () => {
    setGeneratingStages(true);
    try {
      const qCount = activeTournament ? activeTournament.qualifierCount || 2 : 2;
      const tPerQ = activeTournament ? activeTournament.teamsPerQualifier || 12 : 12;
      const batch = writeBatch(db);

      // Create Qualifier matches dynamically
      for (let i = 1; i <= qCount; i++) {
        const qRef = doc(collection(db, "matches"));
        batch.set(qRef, {
          name: `Qualifier ${i}`,
          round: `Qualifier ${i}`,
          map: "Bermuda",
          maxSquads: tPerQ,
          status: "upcoming",
          isPublished: true,
          rules: activeTournament?.rules || "1. No Roof. 2. No Spray. 3. No Emote. 4. Face to Face Fight Only.",
          description: `Qualifier Stage ${i} - Top 6 teams advance to Round 2.`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Create Round 2 Match
      const r2Ref = doc(collection(db, "matches"));
      batch.set(r2Ref, {
        name: "Round 2 (Semi-Finals)",
        round: "Round 2",
        map: "Kalahari",
        maxSquads: (activeTournament?.teamsQualifiedPerQualifier || 6) * qCount + (activeTournament?.premiumPassSlots || 4),
        status: "upcoming",
        isPublished: true,
        rules: activeTournament?.rules || "Standard Clash Squad Championship Rules Apply.",
        description: "Round 2 Semi-Finals - Top 12 teams advance to Grand Final.",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create Grand Final Match
      const gfRef = doc(collection(db, "matches"));
      batch.set(gfRef, {
        name: "Grand Final Championship",
        round: "Grand Final",
        map: "Purgatory",
        maxSquads: 12,
        status: "upcoming",
        isPublished: true,
        rules: activeTournament?.rules || "Grand Final Championship Rules Apply.",
        description: "Official Grand Final Championship Match.",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      toast.success("Tournament Stages Automatically Generated! 🚀");
    } catch {
      toast.error("Failed to auto-generate tournament stages");
    } finally {
      setGeneratingStages(false);
    }
  };

  // Smart Automation: Changing Match Start Time auto-calculates Room Reveal (-10m) & Reg Close (-2h)
  const handleMatchTimeChange = (val: string) => {
    let autoReveal = form.roomRevealTime;
    let autoRegClose = form.regCloseTime;

    if (val) {
      const dt = new Date(val);
      if (!isNaN(dt.getTime())) {
        const pad = (n: number) => String(n).padStart(2, "0");
        const revealDt = new Date(dt.getTime() - 10 * 60 * 1000);
        autoReveal = `${revealDt.getFullYear()}-${pad(revealDt.getMonth() + 1)}-${pad(revealDt.getDate())}T${pad(revealDt.getHours())}:${pad(revealDt.getMinutes())}`;

        const regCloseDt = new Date(dt.getTime() - 2 * 60 * 60 * 1000);
        autoRegClose = `${regCloseDt.getFullYear()}-${pad(regCloseDt.getMonth() + 1)}-${pad(regCloseDt.getDate())}T${pad(regCloseDt.getHours())}:${pad(regCloseDt.getMinutes())}`;
      }
    }

    setForm((prev) => ({
      ...prev,
      matchTime: val,
      matchStartTime: val,
      roomRevealTime: autoReveal,
      regCloseTime: autoRegClose,
    }));
  };

  // Open Edit Config Modal
  const openConfig = (m: MatchItem) => {
    setConfigMatch(m);
    setForm({
      name: m.name || "",
      map: m.map || "Bermuda",
      round: m.round || "Qualifier 1",
      matchTime: m.matchTime || m.matchStartTime || "",
      matchStartTime: m.matchStartTime || m.matchTime || "",
      roomRevealTime: m.roomRevealTime || "",
      regCloseTime: m.regCloseTime || "",
      maxSquads: m.maxSquads || 12,
      status: m.status || "upcoming",
      isPublished: m.isPublished ?? true,
      isArchived: m.isArchived ?? false,
      bannerUrl: m.bannerUrl || "",
      roomId: m.roomId || "",
      roomPassword: m.roomPassword || "",
      streamUrl: m.streamUrl || "",
      whatsappUrl: m.whatsappUrl || "",
      rules: m.rules || "",
      description: m.description || "",
    });
  };

  // Save Config Changes
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configMatch) return;
    try {
      await updateDoc(doc(db, "matches", configMatch.id), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Match details updated for ${form.name}!`);
      setConfigMatch(null);
    } catch {
      toast.error("Failed to update match configuration");
    }
  };

  // Single Delete Handler
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "matches", id));
      setConfirmDeleteId(null);
      toast.success("Stage match deleted");
    } catch {
      toast.error("Failed to delete stage match");
    }
  };

  // Banner Upload Handler
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, bannerUrl: data.url }));
        toast.success("Match banner uploaded!");
      }
    } catch {
      toast.error("Error uploading banner image");
    } finally {
      setUploadingBanner(false);
    }
  };

  // Filtered Matches
  const filteredMatches = matches.filter((m) => {
    const searchMatch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.round.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.map.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;
    if (statusFilter === "all") return true;
    return m.status === statusFilter;
  });

  const inpStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    background: "#FFFFFF",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", fontFamily: "Inter, sans-serif", paddingBottom: 60 }}>
      {/* 1. ENTERPRISE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>
              🏆 Tournament Automation Control Center
            </h1>
            <span style={{ padding: "4px 10px", borderRadius: 8, background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 800 }}>
              {activeTournament ? activeTournament.season : "Season 1"}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Active Tournament: <strong>{activeTournament?.title || "Only Goats Championship"}</strong> • Registered Teams: <strong>{teamCount} / {activeTournament?.maxTeams || 24}</strong>
          </p>
        </div>

        {matches.length === 0 && (
          <button
            onClick={handleAutoGenerateStages}
            disabled={generatingStages}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#DC2626",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              cursor: generatingStages ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(220,38,38,0.25)",
            }}
          >
            {generatingStages ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={16} />}
            <span>{generatingStages ? "Generating Stages..." : "⚡ Auto-Generate Tournament Stages"}</span>
          </button>
        )}
      </div>

      {/* 2. LIVE VISUAL TOURNAMENT FLOWCHART */}
      <div
        style={{
          background: "#0F172A",
          color: "#FFFFFF",
          borderRadius: 20,
          padding: 24,
          marginBottom: 28,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#38BDF8", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={18} /> LIVE TOURNAMENT STAGE FLOWCHART & BRACKET PROGRESSION
        </h3>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", overflowX: "auto", gap: 14, paddingBottom: 10 }}>
          {/* Step 1: Registration */}
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, minWidth: 160, border: "1px solid #334155" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>STEP 1</span>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#FFF", marginTop: 2 }}>Registration</h4>
            <div style={{ fontSize: 12, color: "#38BDF8", fontWeight: 700, marginTop: 6 }}>{teamCount} / {activeTournament?.maxTeams || 24} Teams</div>
            <span style={{ display: "inline-block", marginTop: 8, padding: "2px 8px", borderRadius: 4, background: teamCount >= (activeTournament?.maxTeams || 24) ? "#15803D" : "#0284C7", fontSize: 10, fontWeight: 800, color: "#FFF" }}>
              {teamCount >= (activeTournament?.maxTeams || 24) ? "✅ Full" : "🟢 Open"}
            </span>
          </div>

          <ArrowRight size={16} style={{ color: "#475569", flexShrink: 0 }} />

          {/* Step 2: Qualifier 1 */}
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, minWidth: 160, border: "1px solid #334155" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>STEP 2</span>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#FFF", marginTop: 2 }}>Qualifier 1</h4>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Teams 1-12 Pool</div>
            <span style={{ display: "inline-block", marginTop: 8, padding: "2px 8px", borderRadius: 4, background: "#D97706", fontSize: 10, fontWeight: 800, color: "#FFF" }}>
              Top 6 Advance
            </span>
          </div>

          <ArrowRight size={16} style={{ color: "#475569", flexShrink: 0 }} />

          {/* Step 3: Qualifier 2 */}
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, minWidth: 160, border: "1px solid #334155" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>STEP 3</span>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#FFF", marginTop: 2 }}>Qualifier 2</h4>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Teams 13-24 Pool</div>
            <span style={{ display: "inline-block", marginTop: 8, padding: "2px 8px", borderRadius: 4, background: "#D97706", fontSize: 10, fontWeight: 800, color: "#FFF" }}>
              Top 6 Advance
            </span>
          </div>

          <ArrowRight size={16} style={{ color: "#475569", flexShrink: 0 }} />

          {/* Step 4: Premium Pass */}
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, minWidth: 160, border: "1px solid #334155" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>STEP 4</span>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#C084FC", marginTop: 2 }}>⚡ Premium Pass</h4>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>4 Wildcard Slots</div>
            <span style={{ display: "inline-block", marginTop: 8, padding: "2px 8px", borderRadius: 4, background: "#7E22CE", fontSize: 10, fontWeight: 800, color: "#FFF" }}>
              Eliminated Only
            </span>
          </div>

          <ArrowRight size={16} style={{ color: "#475569", flexShrink: 0 }} />

          {/* Step 5: Round 2 */}
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, minWidth: 160, border: "1px solid #334155" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>STEP 5</span>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#FFF", marginTop: 2 }}>Round 2</h4>
            <div style={{ fontSize: 12, color: "#38BDF8", fontWeight: 700, marginTop: 6 }}>16 Squads Pool</div>
            <span style={{ display: "inline-block", marginTop: 8, padding: "2px 8px", borderRadius: 4, background: "#0284C7", fontSize: 10, fontWeight: 800, color: "#FFF" }}>
              Top 12 Advance
            </span>
          </div>

          <ArrowRight size={16} style={{ color: "#475569", flexShrink: 0 }} />

          {/* Step 6: Grand Final */}
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, minWidth: 160, border: "1px solid #DC2626" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#EF4444", textTransform: "uppercase" }}>CHAMPIONSHIP</span>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#FFF", marginTop: 2 }}>👑 Grand Final</h4>
            <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 700, marginTop: 6 }}>12 Final Squads</div>
            <span style={{ display: "inline-block", marginTop: 8, padding: "2px 8px", borderRadius: 4, background: "#DC2626", fontSize: 10, fontWeight: 800, color: "#FFF" }}>
              Winner Takes All
            </span>
          </div>
        </div>
      </div>

      {/* 3. AUTO-GENERATED STAGE MATCH CARDS LIST */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
          ⚔️ Tournament Stage Matches ({filteredMatches.length})
        </h3>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inpStyle, width: 140 }}>
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">🔴 Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* STAGE CARDS GRID */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 220, borderRadius: 16, background: "#F1F5F9" }} />)}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Swords size={36} style={{ color: "#94A3B8", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>No stage matches generated yet</p>
          <button onClick={handleAutoGenerateStages} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, background: "#DC2626", color: "#FFF", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Auto-Generate Stages Now
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filteredMatches.map((m) => (
            <div key={m.id} style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F0", padding: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>{m.round}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>{m.name}</h3>
                </div>
                <StatusBadge status={m.status || "upcoming"} pulse={m.status === "live"} />
              </div>

              {/* Room ID & Pass Display */}
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 12, marginBottom: 16, border: "1px solid #F1F5F9" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>ROOM ID</span>
                    <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: "#0F172A" }}>{m.roomId || "Not Set"}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>PASSWORD</span>
                    <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: "#0F172A" }}>{m.roomPassword || "Not Set"}</div>
                  </div>
                </div>

                {m.matchTime && (
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #E2E8F0" }}>
                    🕒 Start: <strong>{new Date(m.matchTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => openConfig(m)}
                  style={{
                    flex: 1,
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: "#0F172A",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Edit2 size={14} /> ⚙️ Configure Room & Time
                </button>

                <button onClick={() => setConfirmDeleteId(m.id)} title="Delete Stage" style={{ marginLeft: 8, width: 34, height: 34, borderRadius: 10, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STREAMLINED MATCH CONFIGURATION MODAL */}
      {configMatch && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 24, maxWidth: 580, width: "100%", padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>STAGE CONFIGURATION</span>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A" }}>{form.name}</h3>
              </div>
              <button onClick={() => setConfigMatch(null)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            <form onSubmit={handleSaveConfig} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MATCH START TIME *</label>
                  <input type="datetime-local" required value={form.matchTime} onChange={(e) => handleMatchTimeChange(e.target.value)} style={inpStyle} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAP SELECTION *</label>
                  <select value={form.map} onChange={(e) => setForm((f) => ({ ...f, map: e.target.value }))} style={inpStyle}>
                    <option value="Bermuda">Bermuda</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Alpine">Alpine</option>
                    <option value="Nexterra">Nexterra</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>ROOM ID</label>
                  <input type="text" placeholder="e.g. 99887766" value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>ROOM PASSWORD</label>
                  <input type="text" placeholder="e.g. 123" value={form.roomPassword} onChange={(e) => setForm((f) => ({ ...f, roomPassword: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>LIVE STREAM URL (YOUTUBE / TWITCH)</label>
                <input type="url" placeholder="https://youtube.com/live/..." value={form.streamUrl} onChange={(e) => setForm((f) => ({ ...f, streamUrl: e.target.value }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>WHATSAPP LOBBY LINK</label>
                <input type="url" placeholder="https://chat.whatsapp.com/..." value={form.whatsappUrl} onChange={(e) => setForm((f) => ({ ...f, whatsappUrl: e.target.value }))} style={inpStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MATCH BANNER IMAGE</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "#F1F5F9", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {uploadingBanner ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                    {uploadingBanner ? "Uploading..." : "Upload Image"}
                    <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: "none" }} />
                  </label>
                  {form.bannerUrl && <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Banner Uploaded!</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 14 }}>
                <button type="button" onClick={() => setConfigMatch(null)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#F1F5F9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#DC2626", color: "#FFF", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Save Room & Time</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Stage Match"
          message="Are you sure you want to delete this stage match?"
          confirmLabel="Delete Stage"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
