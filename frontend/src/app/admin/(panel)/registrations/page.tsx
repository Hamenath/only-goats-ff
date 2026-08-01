"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Search, Download, Trash2, Check, X, Eye, Shield, Phone, MessageSquare, CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ImageModal } from "@/components/admin/ImageModal";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

type Status = "all" | "pending" | "approved" | "rejected";

export default function RegistrationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = rows.filter((r) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      r.teamName?.toLowerCase().includes(s) ||
      r.captain?.name?.toLowerCase().includes(s) ||
      r.phone?.includes(s) ||
      r.upiTransactionId?.toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "registrations", id), { status });
    toast.success(`Registration marked as ${status}`);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "registrations", id));
    setConfirmDelete(null);
    toast.success("Registration deleted");
  };

  const bulkApprove = async () => {
    await Promise.all([...selectedIds].map((id) => updateDoc(doc(db, "registrations", id), { status: "approved" })));
    toast.success(`${selectedIds.size} registrations approved`);
    setSelectedIds(new Set());
  };

  const bulkDelete = async () => {
    await Promise.all([...selectedIds].map((id) => deleteDoc(doc(db, "registrations", id))));
    toast.success(`${selectedIds.size} registrations deleted`);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paged.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paged.map((r) => r.id)));
  };

  const exportCSV = () => {
    const headers = ["Team Name", "Captain", "Phone", "WhatsApp", "Transaction ID", "Status", "Created"];
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        [
          r.teamName,
          r.captain?.name,
          r.phone,
          r.whatsapp,
          r.upiTransactionId,
          r.status,
          r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : "",
        ].join(",")
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = "registrations.csv";
    a.click();
  };

  const STATUS_TABS: { key: Status; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* 1. Header & Bulk Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 900,
              color: "#F8FAFC",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Squad Registrations
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            {rows.length} total tournament squad registrations
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={bulkApprove}
                style={{
                  background: "#22C55E",
                  color: "#FFF",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Check size={15} /> Approve ({selectedIds.size})
              </button>
              <button
                onClick={bulkDelete}
                style={{
                  background: "#EF4444",
                  color: "#FFF",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Trash2 size={15} /> Delete ({selectedIds.size})
              </button>
            </>
          )}
          <button
            onClick={exportCSV}
            style={{
              background: "#1E293B",
              color: "#F8FAFC",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "8px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div
        style={{
          background: "#111827",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: 16,
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748B",
            }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search team name, captain, phone, transaction ID..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: 13,
              color: "#F8FAFC",
              background: "#0F172A",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setStatusFilter(t.key);
                setPage(0);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: statusFilter === t.key ? "#2563EB" : "rgba(255, 255, 255, 0.08)",
                background: statusFilter === t.key ? "#2563EB" : "#0F172A",
                color: statusFilter === t.key ? "#FFFFFF" : "#94A3B8",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.label} <span style={{ opacity: 0.7 }}>({counts[t.key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. MOBILE CARDS VIEW (Displayed on mobile screens 0-1023px) */}
      <div className="admin-mobile-only" style={{ flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} style={{ height: 120, borderRadius: 16, background: "#111827" }} />
          ))
        ) : paged.length === 0 ? (
          <div style={{ background: "#111827", padding: 32, borderRadius: 20, textAlign: "center", color: "#94A3B8" }}>
            No squad registrations match your filters.
          </div>
        ) : (
          paged.map((r) => (
            <div
              key={r.id}
              style={{
                background: "#111827",
                borderRadius: 20,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Card Header: Team & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    {r.teamName?.slice(0, 2).toUpperCase() || "SQ"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>
                      {r.teamName || "Unnamed Squad"}
                    </h3>
                    <span style={{ fontSize: 11, color: "#38BDF8", fontWeight: 700 }}>
                      ID: {r.teamId || r.id?.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={r.status || "pending"} />
              </div>

              {/* Card Details Grid */}
              <div
                style={{
                  background: "#0F172A",
                  borderRadius: 14,
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: "#64748B", display: "block", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>CAPTAIN</span>
                  <strong style={{ color: "#F8FAFC" }}>{r.captain?.name || "N/A"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>PHONE</span>
                  <span style={{ color: "#CBD5E1" }}>{r.phone || "N/A"}</span>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>TRANSACTION ID</span>
                  <code style={{ color: "#38BDF8", fontSize: 11, fontFamily: "monospace" }}>{r.upiTransactionId || "N/A"}</code>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>PAYMENT PROOF</span>
                  {r.paymentScreenshotUrl ? (
                    <button
                      onClick={() => setPreviewImg(r.paymentScreenshotUrl)}
                      style={{
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "#38BDF8",
                        border: "none",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Eye size={12} style={{ display: "inline", marginRight: 4 }} /> View Proof
                    </button>
                  ) : (
                    <span style={{ color: "#64748B" }}>No proof</span>
                  )}
                </div>
              </div>

              {/* Stacked Mobile Buttons */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {r.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(r.id, "approved")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "#22C55E",
                      color: "#FFF",
                      border: "none",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(r.id, "rejected")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#F87171",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(r.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#94A3B8",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. DESKTOP TABLE VIEW (Displayed on desktop screens 1024px+) */}
      <div
        className="admin-desktop-only"
        style={{
          background: "#111827",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          overflow: "hidden",
          flexDirection: "column",
          marginBottom: 20,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0F172A", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <th style={thStyle()}>
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={selectedIds.size === paged.length && paged.length > 0}
                  style={{ accentColor: "#2563EB" }}
                />
              </th>
              {["Team", "Captain", "Contact", "Transaction ID", "Screenshot", "Status", "Date", "Actions"].map((h) => (
                <th key={h} style={thStyle()}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={9} style={{ padding: 16 }}>
                    <div style={{ height: 40, borderRadius: 10, background: "#1E293B" }} />
                  </td>
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>
                  No squad registrations found.
                </td>
              </tr>
            ) : (
              paged.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={tdStyle()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      style={{ accentColor: "#2563EB" }}
                    />
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#FFF",
                        }}
                      >
                        {r.teamName?.slice(0, 2).toUpperCase() || "SQ"}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>{r.teamName || "—"}</p>
                        <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{r.teamId || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle()}>
                    <p style={{ fontSize: 13, color: "#F8FAFC", margin: 0, fontWeight: 600 }}>{r.captain?.name || "—"}</p>
                    <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{r.captain?.gameName || ""}</p>
                  </td>
                  <td style={tdStyle()}>
                    <p style={{ fontSize: 13, color: "#F8FAFC", margin: 0 }}>{r.phone || "—"}</p>
                  </td>
                  <td style={tdStyle()}>
                    <code style={{ fontSize: 12, color: "#38BDF8", fontFamily: "monospace" }}>{r.upiTransactionId || "—"}</code>
                  </td>
                  <td style={tdStyle()}>
                    {r.paymentScreenshotUrl ? (
                      <button
                        onClick={() => setPreviewImg(r.paymentScreenshotUrl)}
                        style={{
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#38BDF8",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={13} style={{ display: "inline", marginRight: 4 }} /> View
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#64748B" }}>None</span>
                    )}
                  </td>
                  <td style={tdStyle()}>
                    <StatusBadge status={r.status || "pending"} />
                  </td>
                  <td style={tdStyle()}>
                    <span style={{ fontSize: 12, color: "#64748B" }}>
                      {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}
                    </span>
                  </td>
                  <td style={tdStyle()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {r.status !== "approved" && (
                        <button
                          onClick={() => updateStatus(r.id, "approved")}
                          title="Approve Squad"
                          style={{
                            background: "#22C55E",
                            color: "#FFF",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button
                          onClick={() => updateStatus(r.id, "rejected")}
                          title="Reject Squad"
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#F87171",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            padding: "6px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(r.id)}
                        title="Delete Registration"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#94A3B8",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "6px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {previewImg && <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />}
      {confirmDelete && (
        <ConfirmModal
          title="Delete Registration"
          message="Are you sure you want to delete this squad registration permanently?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function thStyle(): React.CSSProperties {
  return {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 800,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
}

function tdStyle(): React.CSSProperties {
  return {
    padding: "14px 16px",
    verticalAlign: "middle",
  };
}
