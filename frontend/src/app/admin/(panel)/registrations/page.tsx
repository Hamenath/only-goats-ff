"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Search, Download, Trash2, Check, X, Eye, Filter } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ImageModal } from "@/components/admin/ImageModal";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    const unsub = onSnapshot(q, snap => {
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = rows.filter(r => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch = !s || r.teamName?.toLowerCase().includes(s) ||
      r.captain?.name?.toLowerCase().includes(s) || r.phone?.includes(s) ||
      r.upiTransactionId?.toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "registrations", id), { status });
    toast.success(`Registration ${status}`);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "registrations", id));
    setConfirmDelete(null);
    toast.success("Registration deleted");
  };

  const bulkApprove = async () => {
    await Promise.all([...selectedIds].map(id => updateDoc(doc(db, "registrations", id), { status: "approved" })));
    toast.success(`${selectedIds.size} registrations approved`);
    setSelectedIds(new Set());
  };

  const bulkDelete = async () => {
    await Promise.all([...selectedIds].map(id => deleteDoc(doc(db, "registrations", id))));
    toast.success(`${selectedIds.size} registrations deleted`);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paged.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paged.map(r => r.id)));
  };

  const exportCSV = () => {
    const headers = ["Team Name", "Captain", "Phone", "WhatsApp", "Transaction ID", "Status", "Created"];
    const csv = [headers.join(","), ...filtered.map(r =>
      [r.teamName, r.captain?.name, r.phone, r.whatsapp, r.upiTransactionId, r.status,
        r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : ""].join(",")
    )].join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = "registrations.csv"; a.click();
  };

  const STATUS_TABS: { key: Status; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    approved: rows.filter(r => r.status === "approved").length,
    rejected: rows.filter(r => r.status === "rejected").length,
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <AdminPageHeader
        category="Main"
        title="Registrations"
        description={`Manage team signups, payment verification screenshots, approval workflows and export data (${rows.length} total registrations).`}
        actions={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {selectedIds.size > 0 && (
              <>
                <button onClick={bulkApprove} style={{ ...btnStyle("#22C55E"), height: 42, padding: "0 16px", borderRadius: 14 }}>
                  <Check size={16} /> Approve {selectedIds.size}
                </button>
                <button onClick={bulkDelete} style={{ ...btnStyle("#EF4444"), height: 42, padding: "0 16px", borderRadius: 14 }}>
                  <Trash2 size={16} /> Delete {selectedIds.size}
                </button>
              </>
            )}
            <button onClick={exportCSV} style={{ ...btnStyle("#2563EB"), height: 42, padding: "0 18px", borderRadius: 14 }}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div style={{
        background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0",
        padding: 18, marginBottom: 24, boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
        display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search teams, captains, transaction IDs..."
            style={{
              width: "100%", padding: "10px 14px 10px 42px", borderRadius: 14,
              border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A",
              background: "#F8FAFC", outline: "none", fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => { setStatusFilter(t.key); setPage(0); }} style={{
              padding: "8px 16px", borderRadius: 12, border: "1px solid",
              borderColor: statusFilter === t.key ? "#2563EB" : "#E2E8F0",
              background: statusFilter === t.key ? "rgba(37, 99, 235, 0.08)" : "#F8FAFC",
              color: statusFilter === t.key ? "#2563EB" : "#64748B",
              fontSize: 13, fontWeight: statusFilter === t.key ? 700 : 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}>
              {t.label} <span style={{ opacity: 0.7 }}>({counts[t.key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={th()}><input type="checkbox" onChange={toggleAll} checked={selectedIds.size === paged.length && paged.length > 0} style={{ accentColor: "#EF4444" }} /></th>
                {["Team", "Captain", "Contact", "Transaction ID", "Screenshot", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={th()}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={9} style={{ padding: 16 }}>
                    <div style={{ height: 40, borderRadius: 8, background: "#F1F5F9", animation: "shimmer 1.5s infinite" }} />
                  </td></tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>
                  No registrations found.
                </td></tr>
              ) : paged.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                  <td style={td()} data-label="Select"><input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} style={{ accentColor: "#EF4444" }} /></td>
                  <td style={td()} data-label="Team">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#EF4444", flexShrink: 0 }}>
                        {r.teamName?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.teamName || "—"}</p>
                        <p style={{ fontSize: 11, color: "#94A3B8" }}>{r.teamId || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td style={td()} data-label="Captain"><div style={{ fontSize: 13, color: "#0F172A" }}>{r.captain?.name || "—"}</div><div style={{ fontSize: 11, color: "#94A3B8" }}>{r.captain?.gameName || ""}</div></td>
                  <td style={td()} data-label="Contact"><div style={{ fontSize: 12, color: "#64748B" }}>{r.phone || "—"}</div></td>
                  <td style={td()} data-label="Transaction ID"><code style={{ fontSize: 11, background: "#F1F5F9", padding: "3px 6px", borderRadius: 4, color: "#475569" }}>{r.upiTransactionId || "—"}</code></td>
                  <td style={td()} data-label="Screenshot">
                    {r.paymentScreenshotUrl ? (
                      <button onClick={() => setPreviewImg(r.paymentScreenshotUrl)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <img src={r.paymentScreenshotUrl} alt="Screenshot" style={{ width: 44, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #E2E8F0" }} />
                      </button>
                    ) : <span style={{ fontSize: 12, color: "#94A3B8" }}>None</span>}
                  </td>
                  <td style={td()} data-label="Status"><StatusBadge status={r.status || "pending"} /></td>
                  <td style={td()} data-label="Date"><span style={{ fontSize: 11, color: "#94A3B8" }}>{r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}</span></td>
                  <td style={td()} data-label="Actions">
                    <div className="action-btn-group" style={{ display: "flex", gap: 4 }}>
                      <ActionBtn icon={<Check size={13} />} color="#22C55E" title="Approve" onClick={() => updateStatus(r.id, "approved")} />
                      <ActionBtn icon={<X size={13} />} color="#EF4444" title="Reject" onClick={() => updateStatus(r.id, "rejected")} />
                      <ActionBtn icon={<Trash2 size={13} />} color="#DC2626" title="Delete" onClick={() => setConfirmDelete(r.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 12, color: "#64748B" }}>
              Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={pageBtn(page === 0)}>← Prev</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)} style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid",
                  borderColor: i === page ? "#EF4444" : "#E2E8F0",
                  background: i === page ? "#EF4444" : "#fff",
                  color: i === page ? "#fff" : "#64748B",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} style={pageBtn(page === totalPages - 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {previewImg && <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />}
      {confirmDelete && (
        <ConfirmModal
          title="Delete Registration"
          message="This will permanently remove the team registration. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <style>{`
        @keyframes shimmer { 0%{opacity:1} 50%{opacity:0.5} 100%{opacity:1} }
      `}</style>
    </div>
  );
}

function th() { return { padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.04em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }; }
function td() { return { padding: "10px 14px", verticalAlign: "middle" as const }; }
function btnStyle(color: string) { return { display: "inline-flex", alignItems: "center" as const, gap: 5, borderRadius: 8, border: "none", background: color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" } as React.CSSProperties; }
function pageBtn(disabled: boolean) { return { padding: "5px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: disabled ? "#F8FAFC" : "#fff", color: disabled ? "#CBD5E1" : "#64748B", fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" } as React.CSSProperties; }
function ActionBtn({ icon, color, title, onClick }: { icon: React.ReactNode; color: string; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 28, height: 28, borderRadius: 7, border: "none",
      background: color + "15", color, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = color + "30"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = color + "15"; }}
    >
      {icon}
    </button>
  );
}
