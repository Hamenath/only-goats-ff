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
  Flame,
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
  stageType?: "BR" | "CS";
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
  stageType: "BR",
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

interface BRStageForm {
  matchTime: string;
  map: string;
  maxSquads: number;
  rules: string;
  // Qualifier 1 (Pool A)
  q1RoomId: string;
  q1Password: string;
  q1StreamUrl: string;
  q1WhatsappUrl: string;
  // Qualifier 2 (Pool B)
  q2RoomId: string;
  q2Password: string;
  q2StreamUrl: string;
  q2WhatsappUrl: string;
}

interface CSStageForm {
  roundName: "Round 2" | "Semi Final" | "Grand Final";
  matchTime: string;
  map: string;
  maxSquads: number;
  roomId: string;
  roomPassword: string;
  streamUrl: string;
  whatsappUrl: string;
  rules: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [teamCount, setTeamCount] = useState(0);

  // Modal Configure State
  const [configMatch, setConfigMatch] = useState<MatchItem | null>(null);
  const [form, setForm] = useState<Omit<MatchItem, "id">>(DEFAULT_FORM);

  // Stage Creation Modal State
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageTypeSelection, setStageTypeSelection] = useState<"BR" | "CS">("BR");
  const [creatingStage, setCreatingStage] = useState(false);

  // BR Form State
  const [brForm, setBrForm] = useState<BRStageForm>({
    matchTime: "",
    map: "Bermuda",
    maxSquads: 12,
    rules: "1. No Roof. 2. No Spray. 3. No Emote. 4. Face to Face Fight Only.",
    q1RoomId: "",
    q1Password: "",
    q1StreamUrl: "",
    q1WhatsappUrl: "",
    q2RoomId: "",
    q2Password: "",
    q2StreamUrl: "",
    q2WhatsappUrl: "",
  });

  // CS Form State
  const [csForm, setCsForm] = useState<CSStageForm>({
    roundName: "Round 2",
    matchTime: "",
    map: "Kalahari",
    maxSquads: 16,
    roomId: "",
    roomPassword: "",
    streamUrl: "",
    whatsappUrl: "",
    rules: "Standard Clash Squad Championship Rules Apply.",
  });

  // Search & Filter State
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
      const STAGE_ORDER: Record<string, number> = {
        "qualifier 1": 1,
        "qualifier 2": 2,
        "round 2": 3,
        "semi final": 4,
        "grand final": 5,
      };

      const getRank = (item: MatchItem) => {
        const text = `${item.name || ""} ${item.round || ""}`.toLowerCase();
        for (const [k, r] of Object.entries(STAGE_ORDER)) {
          if (text.includes(k)) return r;
        }
        return 99;
      };

      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as MatchItem))
        .sort((a, b) => {
          const rA = getRank(a);
          const rB = getRank(b);
          if (rA !== rB) return rA - rB;
          return (a.name || "").localeCompare(b.name || "");
        });

      setMatches(data);
      setLoading(false);
    });

    return () => {
      unsubActive();
      unsubRegs();
      unsubMatches();
    };
  }, []);

  // BR Stage Completion Status
  const brMatches = matches.filter((m) => m.stageType === "BR" || m.round.includes("Qualifier"));
  const brCompletedCount = brMatches.filter((m) => m.status === "completed").length;
  const isBRStageCompleted = brMatches.length > 0 && brCompletedCount === brMatches.length;

  // Create BR Stage Pair (Qualifier 1 + Qualifier 2)
  const handleCreateBRStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStage(true);
    try {
      const batch = writeBatch(db);
      const pad = (n: number) => String(n).padStart(2, "0");

      let roomReveal = "";
      let regClose = "";

      if (brForm.matchTime) {
        const dt = new Date(brForm.matchTime);
        if (!isNaN(dt.getTime())) {
          const revealDt = new Date(dt.getTime() - 10 * 60 * 1000);
          roomReveal = `${revealDt.getFullYear()}-${pad(revealDt.getMonth() + 1)}-${pad(revealDt.getDate())}T${pad(revealDt.getHours())}:${pad(revealDt.getMinutes())}`;

          const regCloseDt = new Date(dt.getTime() - 2 * 60 * 60 * 1000);
          regClose = `${regCloseDt.getFullYear()}-${pad(regCloseDt.getMonth() + 1)}-${pad(regCloseDt.getDate())}T${pad(regCloseDt.getHours())}:${pad(regCloseDt.getMinutes())}`;
        }
      }

      // Qualifier 1 (Pool A)
      const q1Ref = doc(collection(db, "matches"));
      batch.set(q1Ref, {
        name: "Qualifier 1",
        round: "Qualifier 1",
        stageType: "BR",
        pool: "A",
        map: brForm.map,
        matchTime: brForm.matchTime,
        matchStartTime: brForm.matchTime,
        roomRevealTime: roomReveal,
        regCloseTime: regClose,
        maxSquads: brForm.maxSquads || 12,
        status: "upcoming",
        isPublished: true,
        roomId: brForm.q1RoomId,
        roomPassword: brForm.q1Password,
        streamUrl: brForm.q1StreamUrl,
        whatsappUrl: brForm.q1WhatsappUrl,
        rules: brForm.rules,
        description: "Battle Royale Stage - Qualifier 1 (Pool A)",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Qualifier 2 (Pool B)
      const q2Ref = doc(collection(db, "matches"));
      batch.set(q2Ref, {
        name: "Qualifier 2",
        round: "Qualifier 2",
        stageType: "BR",
        pool: "B",
        map: brForm.map,
        matchTime: brForm.matchTime,
        matchStartTime: brForm.matchTime,
        roomRevealTime: roomReveal,
        regCloseTime: regClose,
        maxSquads: brForm.maxSquads || 12,
        status: "upcoming",
        isPublished: true,
        roomId: brForm.q2RoomId,
        roomPassword: brForm.q2Password,
        streamUrl: brForm.q2StreamUrl,
        whatsappUrl: brForm.q2WhatsappUrl,
        rules: brForm.rules,
        description: "Battle Royale Stage - Qualifier 2 (Pool B)",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      toast.success("🏆 Battle Royale Qualifiers (Pool A & Pool B) Created! 🔥");
      setShowStageModal(false);
    } catch {
      toast.error("Failed to create Battle Royale Stage");
    } finally {
      setCreatingStage(false);
    }
  };

  // Create CS Stage (Knockout Rounds)
  const handleCreateCSStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStage(true);
    try {
      const pad = (n: number) => String(n).padStart(2, "0");
      let roomReveal = "";
      let regClose = "";

      if (csForm.matchTime) {
        const dt = new Date(csForm.matchTime);
        if (!isNaN(dt.getTime())) {
          const revealDt = new Date(dt.getTime() - 10 * 60 * 1000);
          roomReveal = `${revealDt.getFullYear()}-${pad(revealDt.getMonth() + 1)}-${pad(revealDt.getDate())}T${pad(revealDt.getHours())}:${pad(revealDt.getMinutes())}`;

          const regCloseDt = new Date(dt.getTime() - 2 * 60 * 60 * 1000);
          regClose = `${regCloseDt.getFullYear()}-${pad(regCloseDt.getMonth() + 1)}-${pad(regCloseDt.getDate())}T${pad(regCloseDt.getHours())}:${pad(regCloseDt.getMinutes())}`;
        }
      }

      await addDoc(collection(db, "matches"), {
        name: csForm.roundName,
        round: csForm.roundName,
        stageType: "CS",
        map: csForm.map,
        matchTime: csForm.matchTime,
        matchStartTime: csForm.matchTime,
        roomRevealTime: roomReveal,
        regCloseTime: regClose,
        maxSquads: csForm.maxSquads || 16,
        status: "upcoming",
        isPublished: true,
        roomId: csForm.roomId,
        roomPassword: csForm.roomPassword,
        streamUrl: csForm.streamUrl,
        whatsappUrl: csForm.whatsappUrl,
        rules: csForm.rules,
        description: `Clash Squad Stage - ${csForm.roundName}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(`⚔️ Clash Squad ${csForm.roundName} Stage Created! 🚀`);
      setShowStageModal(false);
    } catch {
      toast.error("Failed to create Clash Squad Stage");
    } finally {
      setCreatingStage(false);
    }
  };

  // Smart Automation: Changing Match Start Time
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
      stageType: m.stageType || "BR",
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

  // Group Matches By Stage Type
  const brStageMatches = matches.filter((m) => m.stageType === "BR" || m.round.includes("Qualifier"));
  const csStageMatches = matches.filter((m) => m.stageType === "CS" || !m.round.includes("Qualifier"));

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", fontFamily: "Inter, sans-serif", paddingBottom: 60 }}>
      {/* 1. ENTERPRISE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>
              🏆 Stage-Based Tournament Management
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
          {/* Main Replacement Button: ➕ Create Stage */}
          <button
            onClick={() => setShowStageModal(true)}
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
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
            }}
          >
            <Plus size={16} /> ➕ Create Stage
          </button>
        </div>
      </div>

      {/* 2. STAGE CREATION MODAL */}
      {showStageModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.75)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 24, maxWidth: 760, width: "100%", padding: 32, boxShadow: "0 25px 60px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#DC2626", textTransform: "uppercase" }}>STAGE BUILDER ENGINE</span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>➕ Create Tournament Stage</h2>
              </div>
              <button onClick={() => setShowStageModal(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 22 }}>✕</button>
            </div>

            {/* STEP 1: CHOOSE STAGE TYPE */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#0F172A", marginBottom: 10, textTransform: "uppercase" }}>
                STEP 1: SELECT STAGE TYPE
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <button
                  type="button"
                  onClick={() => setStageTypeSelection("BR")}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: stageTypeSelection === "BR" ? "2px solid #DC2626" : "1.5px solid #E2E8F0",
                    background: stageTypeSelection === "BR" ? "#FEF2F2" : "#FFFFFF",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#DC2626", fontWeight: 900, fontSize: 15 }}>
                    <Flame size={18} /> 🏆 Battle Royale (BR)
                  </div>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.4 }}>
                    Auto-creates Qualifier 1 (Pool A) & Qualifier 2 (Pool B) simultaneous rooms.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStageTypeSelection("CS")}
                  disabled={!isBRStageCompleted && brMatches.length > 0}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: stageTypeSelection === "CS" ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
                    background: stageTypeSelection === "CS" ? "#F0F9FF" : "#FFFFFF",
                    textAlign: "left",
                    cursor: (!isBRStageCompleted && brMatches.length > 0) ? "not-allowed" : "pointer",
                    opacity: (!isBRStageCompleted && brMatches.length > 0) ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0284C7", fontWeight: 900, fontSize: 15 }}>
                    <Swords size={18} /> ⚔️ Clash Squad (CS)
                  </div>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 6, lineHeight: 1.4 }}>
                    Knockout rounds (Round 2, Semi-Final, Grand Final). Unlocks upon BR completion.
                  </p>
                </button>
              </div>
            </div>

            {/* STEP 2: BR STAGE FORM */}
            {stageTypeSelection === "BR" && (
              <form onSubmit={handleCreateBRStage} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 18, border: "1px solid #E2E8F0" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
                    ⚙️ Shared BR Match Settings (Both Qualifiers)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MATCH START TIME *</label>
                      <input type="datetime-local" required value={brForm.matchTime} onChange={(e) => setBrForm((f) => ({ ...f, matchTime: e.target.value }))} style={inpStyle} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAP SELECTION *</label>
                      <select value={brForm.map} onChange={(e) => setBrForm((f) => ({ ...f, map: e.target.value }))} style={inpStyle}>
                        <option value="Bermuda">Bermuda</option>
                        <option value="Kalahari">Kalahari</option>
                        <option value="Purgatory">Purgatory</option>
                        <option value="Alpine">Alpine</option>
                        <option value="Nexterra">Nexterra</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAX TEAMS / QUALIFIER</label>
                      <input type="number" min={2} value={brForm.maxSquads} onChange={(e) => setBrForm((f) => ({ ...f, maxSquads: parseInt(e.target.value) || 12 }))} style={inpStyle} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  {/* Pool A Room */}
                  <div style={{ background: "#EFF6FF", borderRadius: 14, padding: 16, border: "1px solid #BFDBFE" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 6, background: "#2563EB", color: "#FFF", fontSize: 11, fontWeight: 900 }}>POOL A</span>
                      <strong style={{ fontSize: 14, color: "#1E3A8A" }}>Qualifier 1 Room</strong>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input type="text" placeholder="Room ID" value={brForm.q1RoomId} onChange={(e) => setBrForm((f) => ({ ...f, q1RoomId: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                      <input type="text" placeholder="Room Password" value={brForm.q1Password} onChange={(e) => setBrForm((f) => ({ ...f, q1Password: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                    </div>
                  </div>

                  {/* Pool B Room */}
                  <div style={{ background: "#FDF4FF", borderRadius: 14, padding: 16, border: "1px solid #F0ABFC" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 6, background: "#9333EA", color: "#FFF", fontSize: 11, fontWeight: 900 }}>POOL B</span>
                      <strong style={{ fontSize: 14, color: "#581C87" }}>Qualifier 2 Room</strong>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input type="text" placeholder="Room ID" value={brForm.q2RoomId} onChange={(e) => setBrForm((f) => ({ ...f, q2RoomId: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                      <input type="text" placeholder="Room Password" value={brForm.q2Password} onChange={(e) => setBrForm((f) => ({ ...f, q2Password: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="button" onClick={() => setShowStageModal(false)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#F1F5F9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={creatingStage} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#DC2626", color: "#FFF", fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 12px rgba(220,38,38,0.25)" }}>
                    {creatingStage ? "Creating BR Stage..." : "🏆 Create BR Stage Pair"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: CS STAGE FORM */}
            {stageTypeSelection === "CS" && (
              <form onSubmit={handleCreateCSStage} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ background: "#F0F9FF", borderRadius: 16, padding: 18, border: "1px solid #BAE6FD" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0369A1", marginBottom: 12 }}>
                    ⚔️ Clash Squad Stage Details
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 6 }}>ROUND NAME *</label>
                      <select value={csForm.roundName} onChange={(e) => setCsForm((f) => ({ ...f, roundName: e.target.value as any }))} style={inpStyle}>
                        <option value="Round 2">Round 2</option>
                        <option value="Semi Final">Semi Final</option>
                        <option value="Grand Final">Grand Final</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 6 }}>MATCH START TIME *</label>
                      <input type="datetime-local" required value={csForm.matchTime} onChange={(e) => setCsForm((f) => ({ ...f, matchTime: e.target.value }))} style={inpStyle} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0369A1", marginBottom: 6 }}>MAP *</label>
                      <select value={csForm.map} onChange={(e) => setCsForm((f) => ({ ...f, map: e.target.value }))} style={inpStyle}>
                        <option value="Kalahari">Kalahari</option>
                        <option value="Bermuda">Bermuda</option>
                        <option value="Purgatory">Purgatory</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>ROOM ID</label>
                    <input type="text" placeholder="CS Room ID" value={csForm.roomId} onChange={(e) => setCsForm((f) => ({ ...f, roomId: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>ROOM PASSWORD</label>
                    <input type="text" placeholder="CS Password" value={csForm.roomPassword} onChange={(e) => setCsForm((f) => ({ ...f, roomPassword: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="button" onClick={() => setShowStageModal(false)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#F1F5F9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={creatingStage} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#0284C7", color: "#FFF", fontSize: 14, fontWeight: 900, cursor: "pointer" }}>
                    {creatingStage ? "Creating CS Stage..." : "⚔️ Create CS Stage Match"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. STAGE CARDS CONTAINER (GROUPED BY STAGE TYPE) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* GROUP A: 🏆 BATTLE ROYALE STAGE (BR) */}
        <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #F1F5F9", paddingBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Flame size={20} style={{ color: "#DC2626" }} />
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A" }}>🏆 Stage 1: Battle Royale Qualifiers (BR)</h2>
              </div>
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                Simultaneous Qualifier 1 (Pool A) & Qualifier 2 (Pool B). Top 6 teams advance to Round 2.
              </p>
            </div>
            <span style={{ padding: "6px 12px", borderRadius: 8, background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 800, border: "1px solid #FECACA" }}>
              Progress: {brMatches.length > 0 ? Math.round((brCompletedCount / brMatches.length) * 100) : 0}%
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {brStageMatches.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32, color: "#94A3B8", fontSize: 13, background: "#F8FAFC", borderRadius: 12 }}>
                No Battle Royale stages created yet. Click <strong>➕ Create Stage</strong> above.
              </div>
            ) : (
              brStageMatches.map((m) => (
                <div key={m.id} style={{ background: "#F8FAFC", borderRadius: 14, border: "1px solid #E2E8F0", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: m.pool === "A" ? "#EFF6FF" : "#FDF4FF", color: m.pool === "A" ? "#2563EB" : "#9333EA" }}>
                        POOL {m.pool || "A"}
                      </span>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{m.name}</h4>
                    </div>
                    <StatusBadge status={m.status || "upcoming"} pulse={m.status === "live"} />
                  </div>

                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                    Room: <strong>{m.roomId || "Secret"}</strong> • Pass: <strong>{m.roomPassword || "Secret"}</strong>
                  </div>

                  <button onClick={() => openConfig(m)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#0F172A", color: "#FFF", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Edit2 size={13} /> Configure Room
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GROUP B: ⚔️ CLASH SQUAD STAGE (CS) */}
        <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #F1F5F9", paddingBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Swords size={20} style={{ color: "#0284C7" }} />
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A" }}>⚔️ Stage 2: Clash Squad Knockouts (CS)</h2>
              </div>
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                Round 2, Semi-Finals & Grand Final Championship. Unlocks automatically when BR completes.
              </p>
            </div>
            <span style={{ padding: "6px 12px", borderRadius: 8, background: isBRStageCompleted ? "#DCFCE7" : "#F1F5F9", color: isBRStageCompleted ? "#16A34A" : "#64748B", fontSize: 12, fontWeight: 800 }}>
              {isBRStageCompleted ? "🔓 Unlocked & Ready" : "🔒 Waiting for BR Completion"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {csStageMatches.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32, color: "#94A3B8", fontSize: 13, background: "#F8FAFC", borderRadius: 12 }}>
                No Clash Squad knockout stages created yet.
              </div>
            ) : (
              csStageMatches.map((m) => (
                <div key={m.id} style={{ background: "#F8FAFC", borderRadius: 14, border: "1px solid #E2E8F0", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{m.name}</h4>
                    <StatusBadge status={m.status || "upcoming"} pulse={m.status === "live"} />
                  </div>

                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                    Room: <strong>{m.roomId || "Secret"}</strong> • Pass: <strong>{m.roomPassword || "Secret"}</strong>
                  </div>

                  <button onClick={() => openConfig(m)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#0F172A", color: "#FFF", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Edit2 size={13} /> Configure Room
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
