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
  MessageSquare,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
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
  name: "Qualifier Match 1",
  map: "Bermuda",
  round: "Qualifier 1",
  matchTime: "",
  matchStartTime: "",
  roomRevealTime: "",
  regCloseTime: "",
  maxSquads: 24,
  status: "upcoming",
  isPublished: true,
  isArchived: false,
  bannerUrl: "",
  roomId: "",
  roomPassword: "",
  streamUrl: "",
  whatsappUrl: "",
  rules: "1. No Roof. 2. No Spray. 3. No Emote. 4. Face to Face Fight Only.",
  description: "Official Free Fire Clash Squad Tournament Match.",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<MatchItem, "id">>(DEFAULT_FORM);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Accordion Section Expand States
  const [sections, setSections] = useState({
    basic: true,
    room: true,
    links: false,
    rules: false,
    media: false,
    publication: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Real-time Firestore Subscription
  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchItem));
      setMatches(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Smart Automation: Changing Match Start Time auto-calculates Room Reveal (-10m) & Reg Close (-2h)
  const handleMatchTimeChange = (val: string) => {
    let autoReveal = form.roomRevealTime;
    let autoRegClose = form.regCloseTime;

    if (val) {
      const dt = new Date(val);
      if (!isNaN(dt.getTime())) {
        const pad = (n: number) => String(n).padStart(2, "0");

        // 1. Auto Room Reveal: Match Start - 10 Minutes
        const revealDt = new Date(dt.getTime() - 10 * 60 * 1000);
        autoReveal = `${revealDt.getFullYear()}-${pad(revealDt.getMonth() + 1)}-${pad(revealDt.getDate())}T${pad(revealDt.getHours())}:${pad(revealDt.getMinutes())}`;

        // 2. Auto Reg Close: Match Start - 2 Hours
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
        toast.success("Match banner uploaded successfully!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Error uploading banner image");
    } finally {
      setUploadingBanner(false);
    }
  };

  // Submit Handler (Create / Edit)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "matches", editId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        toast.success("Match changes saved!");
      } else {
        await addDoc(collection(db, "matches"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("New match created!");
      }
      setForm(DEFAULT_FORM);
      setEditId(null);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save match");
    }
  };

  // Duplicate Match Handler
  const handleDuplicate = async (m: MatchItem) => {
    try {
      const { id, ...rest } = m;
      await addDoc(collection(db, "matches"), {
        ...rest,
        name: `${m.name} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Match duplicated!");
    } catch {
      toast.error("Failed to duplicate match");
    }
  };

  // Single Delete Handler
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "matches", id));
      setConfirmDeleteId(null);
      toast.success("Match deleted");
    } catch {
      toast.error("Failed to delete match");
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => batch.delete(doc(db, "matches", id)));
      await batch.commit();
      setSelectedIds([]);
      setConfirmBulkDelete(false);
      toast.success(`Deleted ${selectedIds.length} matches`);
    } catch {
      toast.error("Failed bulk deletion");
    }
  };

  // Bulk Publish / Unpublish Handler
  const handleBulkPublish = async (publishState: boolean) => {
    if (!selectedIds.length) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => batch.update(doc(db, "matches", id), { isPublished: publishState }));
      await batch.commit();
      setSelectedIds([]);
      toast.success(`${publishState ? "Published" : "Unpublished"} ${selectedIds.length} matches`);
    } catch {
      toast.error("Failed bulk publish update");
    }
  };

  // Toggle Status Handler
  const toggleStatus = async (id: string, newStatus: MatchItem["status"]) => {
    try {
      await updateDoc(doc(db, "matches", id), { status: newStatus, updatedAt: serverTimestamp() });
      toast.success(`Status updated to ${newStatus.toUpperCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Toggle Lock / Unlock Override
  const toggleRoomLockNow = async (m: MatchItem) => {
    try {
      const isCurrentlyLive = m.status === "live";
      if (isCurrentlyLive) {
        const futureReveal = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        await updateDoc(doc(db, "matches", m.id), {
          roomRevealTime: futureReveal,
          status: "upcoming",
          updatedAt: serverTimestamp(),
        });
        toast.success("Room credentials locked!");
      } else {
        await updateDoc(doc(db, "matches", m.id), {
          roomRevealTime: new Date().toISOString(),
          status: "live",
          updatedAt: serverTimestamp(),
        });
        toast.success("Room unlocked & set to LIVE!");
      }
    } catch {
      toast.error("Failed to toggle room lock");
    }
  };

  // Start Edit Mode
  const startEdit = (m: MatchItem) => {
    setForm({
      name: m.name || "",
      map: m.map || "Bermuda",
      round: m.round || "Qualifier 1",
      matchTime: m.matchTime || m.matchStartTime || "",
      matchStartTime: m.matchStartTime || m.matchTime || "",
      roomRevealTime: m.roomRevealTime || "",
      regCloseTime: m.regCloseTime || "",
      maxSquads: m.maxSquads || 24,
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
    setEditId(m.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtered Matches
  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.map.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.round.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.roomId && m.roomId.includes(searchTerm));

    if (!matchesSearch) return false;

    if (statusFilter === "all") return !m.isArchived;
    if (statusFilter === "archived") return m.isArchived;
    if (statusFilter === "unpublished") return !m.isPublished;
    return m.status === statusFilter;
  });

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage) || 1;
  const paginatedMatches = filteredMatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div style={{ maxWidth: 1240, margin: "0 auto", fontFamily: "Inter, sans-serif", paddingBottom: showForm ? 90 : 0 }}>
      {/* 1. ENTERPRISE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>
            ⚔️ Match Management
          </h1>
          <span style={{ padding: "4px 10px", borderRadius: 8, background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 800, border: "1px solid #FECACA" }}>
            {form.round || "Qualifier 1"}
          </span>
          <StatusBadge status={form.status} pulse={form.status === "live"} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              setForm(DEFAULT_FORM);
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
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
            }}
          >
            <Plus size={16} /> {showForm ? "Close Form" : "Create New Match"}
          </button>
        </div>
      </div>

      {/* 2. COLOR SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Matches", value: matches.length, color: "#3B82F6", bg: "#EFF6FF" },
          { label: "Upcoming", value: matches.filter((m) => m.status === "upcoming").length, color: "#F59E0B", bg: "#FFFBEB" },
          { label: "Live Now", value: matches.filter((m) => m.status === "live").length, color: "#DC2626", bg: "#FEF2F2" },
          { label: "Completed", value: matches.filter((m) => m.status === "completed").length, color: "#10B981", bg: "#ECFDF5" },
          { label: "Draft / Hidden", value: matches.filter((m) => !m.isPublished).length, color: "#64748B", bg: "#F8FAFC" },
          { label: "Cancelled", value: matches.filter((m) => m.status === "cancelled").length, color: "#EF4444", bg: "#FEF2F2" },
        ].map((st) => (
          <div key={st.label} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 16px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{st.label}</span>
            <div style={{ fontSize: 22, fontWeight: 900, color: st.color, marginTop: 4 }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* 3. SPLIT FORM & LIVE PLAYER PREVIEW GRID */}
      {showForm && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }} className="match-editor-grid">
          {/* LEFT COLUMN: COLLAPSIBLE FORM ACCORDIONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* SECTION ①: BASIC MATCH DETAILS */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => toggleSection("basic")}
                style={{ width: "100%", padding: "16px 20px", background: "#F8FAFC", border: "none", borderBottom: sections.basic ? "1px solid #E2E8F0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Swords size={18} style={{ color: "#DC2626" }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>① BASIC MATCH DETAILS</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>Required</span>
                </div>
                {sections.basic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {sections.basic && (
                <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MATCH NAME *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inpStyle} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAP *</label>
                    <select value={form.map} onChange={(e) => setForm((f) => ({ ...f, map: e.target.value }))} style={inpStyle}>
                      <option value="Bermuda">Bermuda</option>
                      <option value="Kalahari">Kalahari</option>
                      <option value="Purgatory">Purgatory</option>
                      <option value="Alpine">Alpine</option>
                      <option value="Nexterra">Nexterra</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>STAGE / ROUND *</label>
                    <select value={form.round} onChange={(e) => setForm((f) => ({ ...f, round: e.target.value }))} style={inpStyle}>
                      <option value="Qualifier 1">Qualifier 1</option>
                      <option value="Qualifier 2">Qualifier 2</option>
                      <option value="Round 2">Round 2</option>
                      <option value="Semi-Final">Semi-Final</option>
                      <option value="Grand Final">Grand Final</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MATCH START TIME *</label>
                    <input type="datetime-local" required value={form.matchTime} onChange={(e) => handleMatchTimeChange(e.target.value)} style={inpStyle} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#DC2626", marginBottom: 6 }}>REGISTRATION CLOSE (AUTO: -2H)</label>
                    <input type="datetime-local" value={form.regCloseTime} onChange={(e) => setForm((f) => ({ ...f, regCloseTime: e.target.value }))} style={{ ...inpStyle, background: "#FEF2F2", borderColor: "#FECACA" }} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>MAXIMUM TEAMS</label>
                    <input type="number" min={2} value={form.maxSquads} onChange={(e) => setForm((f) => ({ ...f, maxSquads: parseInt(e.target.value) || 24 }))} style={inpStyle} />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION ②: ROOM CONFIGURATION */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => toggleSection("room")}
                style={{ width: "100%", padding: "16px 20px", background: "#F8FAFC", border: "none", borderBottom: sections.room ? "1px solid #E2E8F0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Lock size={18} style={{ color: "#0284C7" }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>② ROOM CONFIGURATION & AUTO REVEAL</span>
                </div>
                {sections.room ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {sections.room && (
                <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>ROOM ID (SECRET)</label>
                    <input type="text" placeholder="12345678" value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>ROOM PASSWORD (SECRET)</label>
                    <input type="text" placeholder="999" value={form.roomPassword} onChange={(e) => setForm((f) => ({ ...f, roomPassword: e.target.value }))} style={{ ...inpStyle, fontFamily: "monospace", fontWeight: 700 }} />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#0284C7", marginBottom: 6 }}>
                      🔒 AUTO ROOM REVEAL TIME (DEFAULT: MATCH START - 10 MINS)
                    </label>
                    <input type="datetime-local" value={form.roomRevealTime} onChange={(e) => setForm((f) => ({ ...f, roomRevealTime: e.target.value }))} style={{ ...inpStyle, background: "#F0F9FF", borderColor: "#BAE6FD", fontWeight: 700 }} />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION ③: STREAM & LINKS */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => toggleSection("links")}
                style={{ width: "100%", padding: "16px 20px", background: "#F8FAFC", border: "none", borderBottom: sections.links ? "1px solid #E2E8F0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Video size={18} style={{ color: "#7E22CE" }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>③ STREAM & LOBBY LINKS</span>
                </div>
                {sections.links ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {sections.links && (
                <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>YOUTUBE / TWITCH LIVE STREAM</label>
                    <input type="url" placeholder="https://youtube.com/live/..." value={form.streamUrl} onChange={(e) => setForm((f) => ({ ...f, streamUrl: e.target.value }))} style={inpStyle} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>WHATSAPP LOBBY GROUP LINK</label>
                    <input type="url" placeholder="https://chat.whatsapp.com/..." value={form.whatsappUrl} onChange={(e) => setForm((f) => ({ ...f, whatsappUrl: e.target.value }))} style={inpStyle} />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION ④: MATCH RULES */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => toggleSection("rules")}
                style={{ width: "100%", padding: "16px 20px", background: "#F8FAFC", border: "none", borderBottom: sections.rules ? "1px solid #E2E8F0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={18} style={{ color: "#16A34A" }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>④ QUALIFICATION & MATCH RULES</span>
                </div>
                {sections.rules ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {sections.rules && (
                <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>QUALIFICATION RULES</label>
                    <textarea rows={3} value={form.rules} onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value }))} style={inpStyle} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>DESCRIPTION / NOTES</label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={inpStyle} />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION ⑤: MEDIA */}
            <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <button
                type="button"
                onClick={() => toggleSection("media")}
                style={{ width: "100%", padding: "16px 20px", background: "#F8FAFC", border: "none", borderBottom: sections.media ? "1px solid #E2E8F0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ImageIcon size={18} style={{ color: "#F59E0B" }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>⑤ MATCH MEDIA & BANNER</span>
                </div>
                {sections.media ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {sections.media && (
                <div style={{ padding: 20 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>BANNER IMAGE</label>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#F1F5F9", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {uploadingBanner ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                      {uploadingBanner ? "Uploading..." : "Upload Banner Image"}
                      <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: "none" }} />
                    </label>
                    {form.bannerUrl && <a href={form.bannerUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563EB", fontWeight: 700 }}>Preview Image 📷</a>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PLAYER PREVIEW & MATCH LIFECYCLE TIMELINE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* LIVE PLAYER PREVIEW CARD */}
            <div style={{ background: "#1E293B", color: "#FFFFFF", borderRadius: 20, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Eye size={16} style={{ color: "#38BDF8" }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#38BDF8", textTransform: "uppercase" }}>Live Player Preview</span>
              </div>

              <div style={{ background: "#FFFFFF", color: "#0F172A", borderRadius: 14, padding: 16, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 8 }}>
                  <span>{form.round} • {form.map}</span>
                  <StatusBadge status={form.status} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{form.name || "Match Title"}</h4>

                {/* Secret Room Credentials Locked/Unlocked Preview */}
                <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>
                    🔒 Room Opens (-10m)
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "monospace", color: "#334155" }}>
                    ID: {form.roomId || "Secret"} • PASS: {form.roomPassword || "Secret"}
                  </div>
                </div>
              </div>
            </div>

            {/* MATCH LIFECYCLE TIMELINE PREVIEW */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", padding: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} style={{ color: "#DC2626" }} /> Match Lifecycle Timeline
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A" }} />
                  <span>📝 <strong>Registration Opens</strong></span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", opacity: form.regCloseTime ? 1 : 0.5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span>⏳ <strong>Reg Closes:</strong> {form.regCloseTime ? new Date(form.regCloseTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-2 Hours"}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", opacity: form.roomRevealTime ? 1 : 0.5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0284C7" }} />
                  <span>🔒 <strong>Room Opens:</strong> {form.roomRevealTime ? new Date(form.roomRevealTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-10 Mins"}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", opacity: form.matchTime ? 1 : 0.5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626" }} />
                  <span>⚔️ <strong>Match Starts:</strong> {form.matchTime ? new Date(form.matchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Start Time"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM ACTION FOOTER (Always visible when form open) */}
      {showForm && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFFFFF", borderTop: "1.5px solid #E2E8F0", padding: "14px 32px", zIndex: 9999, boxShadow: "0 -10px 30px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Editing: {form.name}</span>
            <span style={{ fontSize: 11, color: "#64748B" }}>Autosaved in local state</span>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#F8FAFC", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="button" onClick={() => handleSubmit()} style={{ padding: "9px 24px", borderRadius: 8, background: "#DC2626", color: "#FFFFFF", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              {editId ? "Save Changes" : "Create Match"}
            </button>
          </div>
        </div>
      )}

      {/* 4. MATCH LIST GRID & FILTERS */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input type="text" placeholder="Search match name, room ID, map..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inpStyle, paddingLeft: 36 }} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inpStyle, width: 140 }}>
            <option value="all">All Matches</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">🔴 Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{selectedIds.length} Selected</span>
            <button onClick={() => handleBulkPublish(true)} style={{ padding: "6px 12px", background: "#10B981", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Publish</button>
            <button onClick={() => setConfirmBulkDelete(true)} style={{ padding: "6px 12px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
          </div>
        )}
      </div>

      {/* MATCHES GRID */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: 240, borderRadius: 16, background: "#F1F5F9" }} />)}
        </div>
      ) : paginatedMatches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Swords size={36} style={{ color: "#94A3B8", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>No matches found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
          {paginatedMatches.map((m) => {
            const isPasswordVisible = !!showPasswordMap[m.id];
            const isSelected = selectedIds.includes(m.id);

            return (
              <div key={m.id} style={{ background: "#FFFFFF", borderRadius: 16, border: isSelected ? "2px solid #DC2626" : "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
                {m.bannerUrl && (
                  <div style={{ height: 110, width: "100%", overflow: "hidden", background: "#0F172A" }}>
                    <img src={m.bannerUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}

                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{m.name}</h3>
                      <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{m.round} • {m.map}</p>
                    </div>
                    <StatusBadge status={m.status || "upcoming"} pulse={m.status === "live"} />
                  </div>

                  <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 12, marginBottom: 14, border: "1px solid #F1F5F9" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>ROOM ID</span>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{m.roomId || "Not Set"}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>PASSWORD</span>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{isPasswordVisible ? m.roomPassword || "Not Set" : "••••••"}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(["upcoming", "live", "completed", "cancelled"] as const).map((st) => (
                        <button key={st} onClick={() => toggleStatus(m.id, st)} style={{ padding: "4px 8px", borderRadius: 6, border: m.status === st ? "1px solid #DC2626" : "1px solid #E2E8F0", background: m.status === st ? "#FEF2F2" : "#FFFFFF", color: m.status === st ? "#DC2626" : "#64748B", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                          {st}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleDuplicate(m)} title="Duplicate Match" style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#F1F5F9", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Layers size={13} />
                      </button>
                      <button onClick={() => startEdit(m)} title="Edit Match" style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#E0F2FE", color: "#0284C7", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(m.id)} title="Delete Match" style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modals */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Match"
          message="Are you sure you want to delete this match? Action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmModal
          title={`Delete ${selectedIds.length} Matches`}
          message={`Are you sure you want to delete ${selectedIds.length} selected matches?`}
          confirmLabel="Delete Selected"
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}
    </div>
  );
}
