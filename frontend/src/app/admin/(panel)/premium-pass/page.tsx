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
  getDocs,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Zap, CheckCircle2, XCircle, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PremiumEntry {
  id: string;
  teamId: string;
  teamName: string;
  captainName: string;
  phone: string;
  upiTransactionId: string;
  screenshotUrl: string;
  fee: number;
  status: "pending" | "approved" | "rejected";
  createdAt?: any;
}

export default function PremiumPassAdminPage() {
  const [entries, setEntries] = useState<PremiumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "premiumEntries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PremiumEntry));
      setEntries(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const approvedCount = entries.filter((e) => e.status === "approved").length;

  const handleApprove = async (entry: PremiumEntry) => {
    setProcessingId(entry.id);
    try {
      // 1. Update Premium Entry Status
      await updateDoc(doc(db, "premiumEntries", entry.id), {
        status: "approved",
        updatedAt: serverTimestamp(),
      });

      // 2. Find and update Registration document
      const qReg = query(collection(db, "registrations"), where("teamId", "==", entry.teamId));
      const regSnap = await getDocs(qReg);
      if (!regSnap.empty) {
        const regDoc = regSnap.docs[0];
        await updateDoc(doc(db, "registrations", regDoc.id), {
          qualificationStatus: "premium_pass_granted",
          allocatedStage: "Round 2",
          updatedAt: serverTimestamp(),
        });
      }

      // 3. Send Notification
      await addDoc(collection(db, "notifications"), {
        teamId: entry.teamId,
        title: "⚡ Premium Pass Approved! Assigned to Round 2",
        message: `Congratulations! Your ₹40 Premium Pass re-entry for Team ${entry.teamName} has been approved by Admin. Your squad is now allocated to Round 2!`,
        type: "premium_pass_approved",
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success(`Approved Premium Pass for Team ${entry.teamName}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve entry");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "premiumEntries", id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      toast.success("Entry marked as rejected.");
    } catch {
      toast.error("Failed to reject entry");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>
            ⚡ Only Goats Premium Pass Approvals (Max 4 Slots)
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Approve Top 4 eliminated squad re-entries to join Round 2 (Total 16 Teams = 12 Qualified + 4 Premium).
          </p>
        </div>

        <div style={{ padding: "8px 16px", background: "#F3E8FF", borderRadius: 10, border: "1px solid #E9D5FF" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#7E22CE" }}>
            Approved Slots: {approvedCount} / 4
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>Loading entries...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
            No Premium Pass re-entry submissions yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left" }}>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>SQUAD ID</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>TEAM NAME</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>CAPTAIN</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>PHONE</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>UPI TRANS ID</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>SCREENSHOT</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>STATUS</th>
                  <th style={{ padding: "12px 14px", color: "#64748B", fontSize: 11 }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, fontFamily: "monospace" }}>{item.teamId}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0F172A" }}>{item.teamName}</td>
                    <td style={{ padding: "12px 14px" }}>{item.captainName}</td>
                    <td style={{ padding: "12px 14px" }}>{item.phone}</td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#0284C7", fontWeight: 700 }}>{item.upiTransactionId}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {item.screenshotUrl ? (
                        <a href={item.screenshotUrl} target="_blank" rel="noreferrer" style={{ color: "#DC2626", fontWeight: 700, textDecoration: "none" }}>
                          View Proof 📷
                        </a>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {item.status === "approved" && <span style={{ padding: "4px 8px", borderRadius: 6, background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 800 }}>APPROVED</span>}
                      {item.status === "rejected" && <span style={{ padding: "4px 8px", borderRadius: 6, background: "#FEE2E2", color: "#DC2626", fontSize: 11, fontWeight: 800 }}>REJECTED</span>}
                      {item.status === "pending" && <span style={{ padding: "4px 8px", borderRadius: 6, background: "#FEF3C7", color: "#D97706", fontSize: 11, fontWeight: 800 }}>PENDING</span>}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {item.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={processingId === item.id}
                            style={{ padding: "6px 12px", borderRadius: 6, background: "#16A34A", color: "#FFF", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={processingId === item.id}
                            style={{ padding: "6px 10px", borderRadius: 6, background: "#F1F5F9", color: "#64748B", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
