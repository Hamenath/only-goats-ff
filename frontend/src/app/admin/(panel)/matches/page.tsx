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
  name: "",
  map: "Bermuda",
  round: "Qualifier",
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

  // Automatic 10-minute Room Reveal Time Calculation
  const handleMatchTimeChange = (val: string) => {
    let autoReveal = form.roomRevealTime;
    if (val) {
      const dt = new Date(val);
      if (!isNaN(dt.getTime())) {
        // Subtract 10 minutes
        const revealDt = new Date(dt.getTime() - 10 * 60 * 1000);
        const pad = (n: number) => String(n).padStart(2, "0");
        autoReveal = `${revealDt.getFullYear()}-${pad(revealDt.getMonth() + 1)}-${pad(revealDt.getDate())}T${pad(revealDt.getHours())}:${pad(revealDt.getMinutes())}`;
      }
    }
    setForm((prev) => ({
      ...prev,
      matchTime: val,
      matchStartTime: val,
      roomRevealTime: autoReveal,
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "matches", editId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        toast.success("Match updated successfully!");
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
      toast.success("Match duplicated successfully!");
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

  // Toggle Live Status Handler
  const toggleStatus = async (id: string, newStatus: MatchItem["status"]) => {
    try {
      await updateDoc(doc(db, "matches", id), { status: newStatus, updatedAt: serverTimestamp() });
      toast.success(`Match status set to ${newStatus.toUpperCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Toggle Publish Visibility Handler
  const togglePublish = async (id: string, currentState: boolean) => {
    try {
      await updateDoc(doc(db, "matches", id), { isPublished: !currentState });
      toast.success(`Match ${!currentState ? "Published" : "Unpublished"}`);
    } catch {
      toast.error("Failed to update publish state");
    }
  };

  // Quick Action: Lock / Unlock Room Reveal Time Override
  const toggleRoomLockNow = async (m: MatchItem) => {
    try {
      const isCurrentlyLiveOrRevealed = m.status === "live";
      if (isCurrentlyLiveOrRevealed) {
        // Lock room again by pushing reveal time into future
        const futureReveal = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        await updateDoc(doc(db, "matches", m.id), {
          roomRevealTime: futureReveal,
          status: "upcoming",
          updatedAt: serverTimestamp(),
        });
        toast.success("Room credentials locked!");
      } else {
        // Reveal room immediately
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
      round: m.round || "Qualifier",
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

  // Filtered & Search Matches
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

  // Pagination Math
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage) || 1;
  const paginatedMatches = filteredMatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const inpStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    background: "#FAFAFA",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>⚔️ Match Management & Auto Room Reveal</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Manage match schedules, live room IDs, and secure 10-minute auto-reveal triggers.
          </p>
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
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.2)",
            }}
          >
            <Plus size={16} /> {showForm ? "Close Form" : "Create New Match"}
          </button>
        </div>
      </div>

      {/* Stats Overview Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Total Matches", value: matches.length, color: "#3B82F6" },
          { label: "Live Now", value: matches.filter((m) => m.status === "live").length, color: "#DC2626" },
          { label: "Upcoming", value: matches.filter((m) => m.status === "upcoming").length, color: "#F59E0B" },
          { label: "Completed", value: matches.filter((m) => m.status === "completed").length, color: "#10B981" },
          { label: "Unpublished", value: matches.filter((m) => !m.isPublished).length, color: "#64748B" },
        ].map((st) => (
          <div
            key={st.label}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>
              {st.label}
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: st.color, marginTop: 4 }}>
              {st.value}
            </span>
          </div>
        ))}
      </div>

      {/* Form Drawer / Modal */}
      {showForm && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            padding: 24,
            marginBottom: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
              {editId ? "✏️ Edit Match & Room Reveal Settings" : "➕ Create New Tournament Match"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}
            >
              <XCircle size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  MATCH TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Qualifier Match 1"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  style={inpStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  MAP *
                </label>
                <select
                  value={form.map}
                  onChange={(e) => setForm((f) => ({ ...f, map: e.target.value }))}
                  style={inpStyle}
                >
                  <option value="Bermuda">Bermuda</option>
                  <option value="Kalahari">Kalahari</option>
                  <option value="Purgatory">Purgatory</option>
                  <option value="Alpine">Alpine</option>
                  <option value="Nexterra">Nexterra</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  STAGE / ROUND *
                </label>
                <select
                  value={form.round}
                  onChange={(e) => setForm((f) => ({ ...f, round: e.target.value }))}
                  style={inpStyle}
                >
                  <option value="Qualifier">Qualifier Stage</option>
                  <option value="Quarter-Final">Quarter-Final</option>
                  <option value="Semi-Final">Semi-Final</option>
                  <option value="Grand Final">Grand Final</option>
                  <option value="Custom Room">Custom Room</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  MATCH START TIME *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.matchTime}
                  onChange={(e) => handleMatchTimeChange(e.target.value)}
                  style={inpStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#DC2626", marginBottom: 6 }}>
                  🔒 ROOM REVEAL TIME (AUTO: START - 10 MINS)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.roomRevealTime}
                  onChange={(e) => setForm((f) => ({ ...f, roomRevealTime: e.target.value }))}
                  style={{ ...inpStyle, borderColor: "#FCA5A5", background: "#FEF2F2", fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  REGISTRATION CLOSE TIME
                </label>
                <input
                  type="datetime-local"
                  value={form.regCloseTime}
                  onChange={(e) => setForm((f) => ({ ...f, regCloseTime: e.target.value }))}
                  style={inpStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  MAX SQUADS
                </label>
                <input
                  type="number"
                  min={2}
                  max={48}
                  value={form.maxSquads}
                  onChange={(e) => setForm((f) => ({ ...f, maxSquads: parseInt(e.target.value) || 24 }))}
                  style={inpStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  STATUS
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  style={inpStyle}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">🔴 Live Now</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  ROOM ID (SECRET)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12345678"
                  value={form.roomId}
                  onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                  style={inpStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  ROOM PASSWORD (SECRET)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 999"
                  value={form.roomPassword}
                  onChange={(e) => setForm((f) => ({ ...f, roomPassword: e.target.value }))}
                  style={inpStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  LIVE STREAM URL (YOUTUBE / TWITCH)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/live/..."
                  value={form.streamUrl}
                  onChange={(e) => setForm((f) => ({ ...f, streamUrl: e.target.value }))}
                  style={inpStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  WHATSAPP GROUP LINK
                </label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={form.whatsappUrl}
                  onChange={(e) => setForm((f) => ({ ...f, whatsappUrl: e.target.value }))}
                  style={inpStyle}
                />
              </div>

              {/* Match Banner Upload */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  MATCH BANNER IMAGE
                </label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      background: "#F1F5F9",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {uploadingBanner ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                    {uploadingBanner ? "Uploading..." : "Choose Image"}
                    <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: "none" }} />
                  </label>
                  {form.bannerUrl && (
                    <a href={form.bannerUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#2563EB" }}>
                      Preview Image
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Rules & Description Text Areas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  QUALIFICATION & PLAYING RULES
                </label>
                <textarea
                  rows={3}
                  value={form.rules}
                  onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value }))}
                  style={{ ...inpStyle, resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>
                  MATCH DESCRIPTION / NOTES
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ ...inpStyle, resize: "vertical" }}
                />
              </div>
            </div>

            {/* Visibility Checkbox */}
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: "#DC2626" }}
              />
              <label htmlFor="isPublished" style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>
                Publish match to website immediately
              </label>
            </div>

            {/* Submit Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "9px 24px",
                  borderRadius: 8,
                  background: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {editId ? "Save Match Changes" : "Create Match"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Bulk Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search by match name, room ID, map..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inpStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inpStyle, width: 140 }}
          >
            <option value="all">All Matches</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">🔴 Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="unpublished">Unpublished</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => handleBulkPublish(true)}
              style={{ padding: "6px 12px", background: "#10B981", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              style={{ padding: "6px 12px", background: "#64748B", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Unpublish
            </button>
            <button
              onClick={() => setConfirmBulkDelete(true)}
              style={{ padding: "6px 12px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 240, borderRadius: 16, background: "#F1F5F9" }} />
          ))}
        </div>
      ) : paginatedMatches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0" }}>
          <Swords size={36} style={{ color: "#94A3B8", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>No matches found</p>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Try creating a match or adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
          {paginatedMatches.map((m) => {
            const isPasswordVisible = !!showPasswordMap[m.id];
            const isSelected = selectedIds.includes(m.id);
            const revealDate = m.roomRevealTime ? new Date(m.roomRevealTime) : null;
            const isRevealed = m.status === "live" || (revealDate && Date.now() >= revealDate.getTime());

            return (
              <div
                key={m.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  border: isSelected ? "2px solid #DC2626" : "1px solid #E2E8F0",
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                  position: "relative",
                }}
              >
                {/* Optional Banner Image */}
                {m.bannerUrl && (
                  <div style={{ height: 110, width: "100%", position: "relative", overflow: "hidden", background: "#0F172A" }}>
                    <img src={m.bannerUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}

                <div style={{ padding: 18 }}>
                  {/* Select Checkbox & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds((prev) => [...prev, m.id]);
                          else setSelectedIds((prev) => prev.filter((id) => id !== m.id));
                        }}
                        style={{ width: 16, height: 16, accentColor: "#DC2626", cursor: "pointer" }}
                      />
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{m.name || "Unnamed Match"}</h3>
                        <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                          {m.round} • {m.map} • Max {m.maxSquads || 24} Squads
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => togglePublish(m.id, m.isPublished)}
                        title={m.isPublished ? "Published to website" : "Unpublished (Draft)"}
                        style={{
                          background: m.isPublished ? "#E0F2FE" : "#F1F5F9",
                          color: m.isPublished ? "#0284C7" : "#94A3B8",
                          border: "none",
                          borderRadius: 6,
                          padding: 5,
                          cursor: "pointer",
                        }}
                      >
                        {m.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <StatusBadge status={m.status || "upcoming"} pulse={m.status === "live"} />
                    </div>
                  </div>

                  {/* Room Details Grid */}
                  <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 12, marginBottom: 14, border: "1px solid #F1F5F9" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
                          Room ID
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>
                            {m.roomId || "Not Set"}
                          </span>
                          {m.roomId && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(m.roomId!);
                                toast.success("Room ID copied!");
                              }}
                              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
                          Password
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>
                            {isPasswordVisible ? m.roomPassword || "Not Set" : "••••••"}
                          </span>
                          {m.roomPassword && (
                            <button
                              onClick={() =>
                                setShowPasswordMap((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                              }
                              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}
                            >
                              {isPasswordVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B" }}>
                      <span>⏰ Start: {m.matchTime ? new Date(m.matchTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "TBD"}</span>
                      <span style={{ fontWeight: 700, color: isRevealed ? "#16A34A" : "#DC2626" }}>
                        🔒 Reveal: {revealDate ? revealDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Start - 10m"}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle & Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(["upcoming", "live", "completed", "cancelled"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => toggleStatus(m.id, st)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: m.status === st ? "1px solid #DC2626" : "1px solid #E2E8F0",
                            background: m.status === st ? "#FEF2F2" : "#FFFFFF",
                            color: m.status === st ? "#DC2626" : "#64748B",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => toggleRoomLockNow(m)}
                        title={isRevealed ? "Lock Room Credentials" : "Unlock & Reveal Room Now"}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: "none",
                          background: isRevealed ? "#FEF2F2" : "#DCFCE7",
                          color: isRevealed ? "#DC2626" : "#16A34A",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isRevealed ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>

                      <button
                        onClick={() => handleDuplicate(m)}
                        title="Duplicate Match"
                        style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#F1F5F9", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Layers size={13} />
                      </button>

                      <button
                        onClick={() => startEdit(m)}
                        title="Edit Match"
                        style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#E0F2FE", color: "#0284C7", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(m.id)}
                        title="Delete Match"
                        style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28, alignItems: "center" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFF", fontSize: 12, fontWeight: 600, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            Previous
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFF", fontSize: 12, fontWeight: 600, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modals */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Match"
          message="Are you sure you want to delete this match? This action cannot be undone."
          confirmLabel="Delete Match"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmModal
          title={`Delete ${selectedIds.length} Matches`}
          message={`Are you sure you want to delete ${selectedIds.length} selected matches? This action cannot be undone.`}
          confirmLabel="Delete Selected"
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}
    </div>
  );
}
