"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { ImageModal } from "@/components/admin/ImageModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Check, X, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const pending = rows.filter(r => r.status === "pending");
  const approved = rows.filter(r => r.status === "approved");
  const rejected = rows.filter(r => r.status === "rejected");
  const revenue = approved.length * 100;

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "registrations", id), { status });
    toast.success(`Payment ${status}`);
  };

  const cards = [
    { label: "Pending", count: pending.length, color: "#F59E0B", bg: "#FEF9C3" },
    { label: "Approved", count: approved.length, color: "#22C55E", bg: "#DCFCE7" },
    { label: "Rejected", count: rejected.length, color: "#EF4444", bg: "#FEE2E2" },
    { label: "Total Revenue", count: `₹${revenue.toLocaleString()}`, color: "#0EA5E9", bg: "#E0F2FE" },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Payments</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Review and verify payment screenshots</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["Team", "Transaction ID", "Amount", "Screenshot", "Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={7} style={{ padding: 16 }}>
                    <div style={{ height: 40, borderRadius: 8, background: "#F1F5F9" }} />
                  </td></tr>
                ))
              ) : rows.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{r.teamName || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{r.captain?.name}</div>
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <code style={{ fontSize: 11, background: "#F1F5F9", padding: "3px 6px", borderRadius: 4, color: "#475569" }}>{r.upiTransactionId || "—"}</code>
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>₹100</span>
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    {r.paymentScreenshotUrl ? (
                      <button onClick={() => setPreview(r.paymentScreenshotUrl)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <img src={r.paymentScreenshotUrl} alt="Screenshot" style={{ width: 48, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid #E2E8F0" }} />
                      </button>
                    ) : <span style={{ fontSize: 12, color: "#94A3B8" }}>No screenshot</span>}
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>{r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}><StatusBadge status={r.status || "pending"} /></td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => updateStatus(r.id, "approved")} title="Approve" style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#DCFCE7", color: "#16A34A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => updateStatus(r.id, "rejected")} title="Reject" style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {preview && <ImageModal src={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
