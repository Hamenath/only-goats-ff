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
  pool?: "A" | "B";
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
  pool: "A",
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

interface PairForm {
  matchTime: string;
  map: string;
  maxSquads: number;
  rules: string;

  // Qualifier 1 (Pool A)
  q1RoomId: string;
  q1Password: string;
  q1StreamUrl: string;
  q1WhatsappUrl: string;
  q1BannerUrl: string;

  // Qualifier 2 (Pool B)
  q2RoomId: string;
  q2Password: string;
  q2StreamUrl: string;
  q2WhatsappUrl: string;
  q2BannerUrl: string;
}

const DEFAULT_PAIR_FORM: PairForm = {
  matchTime: "",
  map: "Bermuda",
  maxSquads: 12,
  rules: "1. No Roof. 2. No Spray. 3. No Emote. 4. Face to Face Fight Only.",
  q1RoomId: "",
  q1Password: "",
  q1StreamUrl: "",
  q1WhatsappUrl: "",
  q1BannerUrl: "",
  q2RoomId: "",
  q2Password: "",
  q2StreamUrl: "",
  q2WhatsappUrl: "",
  q2BannerUrl: "",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [teamCount, setTeamCount] = useState(0);

  // Modal State
  const [configMatch, setConfigMatch] = useState<MatchItem | null>(null);
  const [form, setForm] = useState<Omit<MatchItem, "id">>(DEFAULT_FORM);

  // Qualifier Pair Modal State
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairForm, setPairForm] = useState<PairForm>(DEFAULT_PAIR_FORM);
  const [creatingPair, setCreatingPair] = useState(false);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [generatingStages, setGeneratingStages] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 1. Fetch Active Tournament and Real-time Matches
  useEffect(() => {
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

    const unsubRegs = onSnapshot(collection(db, "registrations"), (snap) => {
      setTeamCount(snap.docs.length);
    });

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

  // Save Qualifier Pair Handler (Creates BOTH Qualifiers simultaneously in a batch)
  const handleSaveQualifierPair = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPair(true);
    try {
      const batch = writeBatch(db);
      const pad = (n: number) => String(n).padStart(2, "0");

      let roomReveal = "";
      let regClose = "";

      if (pairForm.matchTime) {
        const dt = new Date(pairForm.matchTime);
        if (!isNaN(dt.getTime())) {
          // Room Reveal: Start - 10m
          const revealDt = new Date(dt.getTime() - 10 * 60 * 1000);
          roomReveal = `${revealDt.getFullYear()}-${pad(revealDt.getMonth() + 1)}-${pad(revealDt.getDate())}T${pad(revealDt.getHours())}:${pad(revealDt.getMinutes())}`;

          // Reg Close: Start - 2h
          const regCloseDt = new Date(dt.getTime() - 2 * 60 * 60 * 1000);
          regClose = `${regCloseDt.getFullYear()}-${pad(regCloseDt.getMonth() + 1)}-${pad(regCloseDt.getDate())}T${pad(regCloseDt.getHours())}:${pad(regCloseDt.getMinutes())}`;
        }
      }

      // Qualifier 1 (Pool A)
      const q1Ref = doc(collection(db, "matches"));
      batch.set(q1Ref, {
        name: "Qualifier 1",
        round: "Qualifier 1",
        pool: "A",
        map: pairForm.map,
        matchTime: pairForm.matchTime,
        matchStartTime: pairForm.matchTime,
        roomRevealTime: roomReveal,
        regCloseTime: regClose,
        maxSquads: pairForm.maxSquads || 12,
        status: "upcoming",
        isPublished: true,
        roomId: pairForm.q1RoomId,
        roomPassword: pairForm.q1Password,
        streamUrl: pairForm.q1StreamUrl,
        whatsappUrl: pairForm.q1WhatsappUrl,
        bannerUrl: pairForm.q1BannerUrl,
        rules: pairForm.rules,
        description: "Qualifier 1 (Pool A) - Top 6 teams advance to Round 2.",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Qualifier 2 (Pool B)
      const q2Ref = doc(collection(db, "matches"));
      batch.set(q2Ref, {
        name: "Qualifier 2",
        round: "Qualifier 2",
        pool: "B",
        map: pairForm.map,
        matchTime: pairForm.matchTime,
        matchStartTime: pairForm.matchTime,
        roomRevealTime: roomReveal,
        regCloseTime: regClose,
        maxSquads: pairForm.maxSquads || 12,
        status: "upcoming",
        isPublished: true,
        roomId: pairForm.q2RoomId,
        roomPassword: pairForm.q2Password,
        streamUrl: pairForm.q2StreamUrl,
        whatsappUrl: pairForm.q2WhatsappUrl,
        bannerUrl: pairForm.q2BannerUrl,
        rules: pairForm.rules,
        description: "Qualifier 2 (Pool B) - Top 6 teams advance to Round 2.",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      toast.success("🏆 Qualifier 1 & Qualifier 2 Created Simultaneously! 🔥");
      setShowPairModal(false);
      setPairForm(DEFAULT_PAIR_FORM);
    } catch {
      toast.error("Failed to create Qualifier Pair");
    } finally {
      setCreatingPair(false);
    }
  };

  // Auto Generate Stages Function
  const handleAutoGenerateStages = async () => {
    setGeneratingStages(true);
    try {
      const qCount = activeTournament ? activeTournament.qualifierCount || 2 : 2;
      const tPerQ = activeTournament ? activeTournament.teamsPerQualifier || 12 : 12;
      const batch = writeBatch(db);

      for (let i = 1; i <= qCount; i++) {
        const poolLetter = i === 1 ? "A" : i === 2 ? "B" : String.fromCharCode(64 + i);
        const qRef = doc(collection(db, "matches"));
        batch.set(qRef, {
          name: `Qualifier ${i}`,
          round: `Qualifier ${i}`,
          pool: poolLetter,
          map: "Bermuda",
          maxSquads: tPerQ,
          status: "upcoming",
          isPublished: true,
          rules: activeTournament?.rules || "1. No Roof. 2. No Spray. 3. No Emote. 4. Face to Face Fight Only.",
          description: `Qualifier Stage ${i} (Pool ${poolLetter}) - Top 6 teams advance to Round 2.`,
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

  // Smart Automation
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
      pool: m.pool || "A",
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
              ⚔️ Match Management & Automation
            </h1>
            <span style={{ padding: "4px 10px", borderRadius: 8, background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 800 }}>
              {activeTournament ? activeTournament.season : "Season 1"}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Active Tournament: <strong>{activeTournament?.title || "Only Goats Championship"}</strong> • Registered Teams: <strong>{teamCount} / {activeTournament?.maxTeams || 24}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {/* New Button: Create Qualifier Pair */}
          <button
            onClick={() => setShowPairModal(true)}
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
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
            }}
          >
            <Plus size={16} /> ➕ Create Qualifier Pair
          </button>

          {matches.length === 0 && (
            <button
              onClick={handleAutoGenerateStages}
              disabled={generatingStages}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                cursor: generatingStages ? "not-allowed" : "pointer",
              }}
            >
              {generatingStages ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={16} />}
              <span>Auto-Generate Stages</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SIMULTANEOUS QUALIFIER PAIR CREATION MODAL */}
      {showPairModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 24, maxWidth: 760, width: "100%", padding: 32, boxShadow: "0 25px 60px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.04em" }}>SIMULTANEOUS QUALIFIER ENGINE</span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>🏆 Create Qualifier Pair (Pool A & Pool B)</h2>
              </div>
              <button onClick={() => setShowPairModal(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 22 }}>✕</button>
            </div>

            <form onSubmit={handleSaveQualifierPair} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* COMMON SHARED SETTINGS */}
              <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 18, border: "1px solid #E2E8F0" }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  ⚙️ Shared Match Settings (Both Qualifiers)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MATCH START TIME *</label>
                    <input type="datetime-local" required value={pairForm.matchTime} onChange={(e) => setPairForm((f) => ({ ...f, matchTime: e.target.value }))} style={inpStyle} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAP SELECTION *</label>
                    <select value={pairForm.map} onChange={(e) => setPairForm((f) => ({ ...f, map: e.target.value }))} style={inpStyle}>
                      <option value="Bermuda">Bermuda</option>
                      <option value="Kalahari">Kalahari</option>
                      <option value="Purgatory">Purgatory</option>
                      <option value="Alpine">Alpine</option>
                      <option value="Nexterra">Nexterra</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAX TEAMS / QUALIFIER</label>
                    <input type="number" min={2} value={pairForm.maxSquads} onChange={(e) => setPairForm((f) => ({ ...f, maxSquads: parseInt(e.target.value) || 12 }))} style={inpStyle} />
                  </div>
                </div>
              </div>

              {/* INDEPENDENT QUALIFIER ROOMS GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* QUALIFIER 1 (POOL A) */}
                <div style={{ background: "#EFF6FF", borderRadius: 16, padding: 18, border: "1.5px solid #BFDBFE" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "#2563EB", color: "#FFF", fontSize: 12, fontWeight: 900 }}>POOL A</span>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#1E3A8A" }}>Qualifier 1 Room</h4>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>ROOM ID</label>
                      <input type="text" placeholder="Qualifier 1 Room ID" value={pairForm.q1RoomId} onChange={(e) => setPairForm((f) => ({ ...f, q1RoomId: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>ROOM PASSWORD</label>
                      <input type="text" placeholder="Qualifier 1 Password" value={pairForm.q1Password} onChange={(e) => setPairForm((f) => ({ ...f, q1Password: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>STREAM LINK (OPTIONAL)</label>
                      <input type="url" placeholder="https://youtube.com/live/..." value={pairForm.q1StreamUrl} onChange={(e) => setPairForm((f) => ({ ...f, q1StreamUrl: e.target.value }))} style={inpStyle} />
                    </div>
                  </div>
                </div>

                {/* QUALIFIER 2 (POOL B) */}
                <div style={{ background: "#FDF4FF", borderRadius: 16, padding: 18, border: "1.5px solid #F0ABFC" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "#9333EA", color: "#FFF", fontSize: 12, fontWeight: 900 }}>POOL B</span>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#581C87" }}>Qualifier 2 Room</h4>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B21A8", marginBottom: 4 }}>ROOM ID</label>
                      <input type="text" placeholder="Qualifier 2 Room ID" value={pairForm.q2RoomId} onChange={(e) => setPairForm((f) => ({ ...f, q2RoomId: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B21A8", marginBottom: 4 }}>ROOM PASSWORD</label>
                      <input type="text" placeholder="Qualifier 2 Password" value={pairForm.q2Password} onChange={(e) => setPairForm((f) => ({ ...f, q2Password: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B21A8", marginBottom: 4 }}>STREAM LINK (OPTIONAL)</label>
                      <input type="url" placeholder="https://youtube.com/live/..." value={pairForm.q2StreamUrl} onChange={(e) => setPairForm((f) => ({ ...f, q2StreamUrl: e.target.value }))} style={inpStyle} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 10 }}>
                <button type="button" onClick={() => setShowPairModal(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#F1F5F9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={creatingPair} style={{ padding: "10px 26px", borderRadius: 10, border: "none", background: "#DC2626", color: "#FFF", fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 14px rgba(220,38,38,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
                  {creatingPair ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={16} />}
                  <span>{creatingPair ? "Creating Both Qualifiers..." : "Save both Qualifiers"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. LINKED QUALIFIER PAIR CARD & STAGE LIST */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
          ⚔️ Stage Matches ({filteredMatches.length})
        </h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inpStyle, width: 140 }}>
          <option value="all">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">🔴 Live</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* STAGE CARDS GRID */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 220, borderRadius: 16, background: "#F1F5F9" }} />)}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Swords size={36} style={{ color: "#94A3B8", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>No stage matches found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filteredMatches.map((m) => (
            <div key={m.id} style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F0", padding: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>{m.round}</span>
                    {m.pool && (
                      <span style={{ padding: "2px 6px", borderRadius: 4, background: m.pool === "A" ? "#EFF6FF" : "#FDF4FF", color: m.pool === "A" ? "#2563EB" : "#9333EA", fontSize: 10, fontWeight: 900 }}>
                        POOL {m.pool}
                      </span>
                    )}
                  </div>
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
                  <Edit2 size={14} /> ⚙️ Configure Match
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
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>LIVE STREAM URL</label>
                <input type="url" placeholder="https://youtube.com/live/..." value={form.streamUrl} onChange={(e) => setForm((f) => ({ ...f, streamUrl: e.target.value }))} style={inpStyle} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 14 }}>
                <button type="button" onClick={() => setConfigMatch(null)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#F1F5F9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#DC2626", color: "#FFF", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Save Match Details</button>
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
