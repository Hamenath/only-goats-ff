"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { AlertTriangle, Trash2, Download, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface DangerZoneCardProps {
  onResetSuccess?: () => void;
}

export function DangerZoneCard({ onResetSuccess }: DangerZoneCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [downloadBackup, setDownloadBackup] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [progressText, setProgressText] = useState("");

  // Function to export registrations as CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const snap = await getDocs(collection(db, "registrations"));
      if (snap.empty) {
        toast("No registrations available to export", { icon: "ℹ️" });
        setIsExporting(false);
        return false;
      }

      const rows: string[][] = [
        [
          "Squad ID",
          "Team Name",
          "Captain Name",
          "Captain UID",
          "Captain Game Name",
          "Phone",
          "WhatsApp",
          "Player 2 Name",
          "Player 2 UID",
          "Player 3 Name",
          "Player 3 UID",
          "Player 4 Name",
          "Player 4 UID",
          "Substitute Name",
          "Substitute UID",
          "UPI Trans ID",
          "Payment Screenshot URL",
          "Status",
          "Registered At",
        ],
      ];

      snap.docs.forEach((doc) => {
        const d = doc.data();
        const captain = d.captain || {};
        const players = Array.isArray(d.players) ? d.players : [];
        const sub = d.substitute || {};
        const p2 = players[0] || {};
        const p3 = players[1] || {};
        const p4 = players[2] || {};

        rows.push([
          d.teamId || "",
          d.teamName || "",
          captain.name || "",
          captain.uid || "",
          captain.gameName || "",
          d.phone || "",
          d.whatsapp || "",
          p2.name || "",
          p2.uid || "",
          p3.name || "",
          p3.uid || "",
          p4.name || "",
          p4.uid || "",
          sub.name || "",
          sub.uid || "",
          d.upiTransactionId || "",
          d.paymentScreenshotUrl || "",
          d.status || "pending",
          d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString(),
        ]);
      });

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `only-goats-registrations-backup-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Backup downloaded successfully!");
      return true;
    } catch (err: any) {
      console.error("CSV Export error:", err);
      toast.error("Failed to export CSV backup");
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  // Function to execute backend reset
  const handleExecuteReset = async () => {
    if (confirmInput.trim() !== "RESET") {
      toast.error("Please type RESET exactly to confirm");
      return;
    }

    setIsResetting(true);

    if (downloadBackup) {
      setProgressText("Generating CSV Backup...");
      await handleExportCSV();
    }

    try {
      setProgressText("Deleting tournament registrations...");
      await new Promise((r) => setTimeout(r, 600));

      setProgressText("Deleting payment screenshots from Cloudinary...");
      await new Promise((r) => setTimeout(r, 600));

      setProgressText("Resetting registration counter to 0...");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/admin/reset`, {
        method: "POST",
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to reset tournament database");
      }

      toast.success(`✅ Tournament Reset Successfully! Deleted ${result.deletedRegistrations} squads.`);
      setIsModalOpen(false);
      setConfirmInput("");

      if (onResetSuccess) {
        onResetSuccess();
      } else {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err: any) {
      console.error("Reset Error:", err);
      toast.error(err.message || "Failed to reset tournament database");
    } finally {
      setIsResetting(false);
      setProgressText("");
    }
  };

  return (
    <>
      {/* Danger Zone Section Card */}
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FCA5A5",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 24,
          boxShadow: "0 4px 20px rgba(239, 68, 68, 0.06)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #FEE2E2",
            background: "#FFF5F5",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ShieldAlert size={20} style={{ color: "#DC2626" }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#991B1B", fontFamily: "Inter, sans-serif" }}>
            🚨 Danger Zone
          </h3>
        </div>

        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 16, lineHeight: 1.5 }}>
            Reset the tournament database to start a new season. This will permanently delete all squad registrations, clear Cloudinary payment screenshots, and reset the registration counter back to <strong>OG-VERIFIED(1)</strong>. This action is irreversible.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 20px",
                background: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 2px 10px rgba(220, 38, 38, 0.25)",
                transition: "all 0.2s ease",
              }}
            >
              <Trash2 size={16} />
              Reset Tournament Database
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 18px",
                background: "#FFFFFF",
                color: "#374151",
                border: "1px solid #D1D5DB",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: isExporting ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {isExporting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={16} />}
              Export Registrations (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Double Confirmation Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              border: "1px solid #FEE2E2",
              overflow: "hidden",
              fontFamily: "Inter, sans-serif",
              animation: "modalIn 0.2s ease-out forwards",
            }}
          >
            <div style={{ padding: "24px 24px 16px", background: "#FEF2F2", borderBottom: "1px solid #FEE2E2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ padding: 10, borderRadius: "50%", background: "#FEE2E2", color: "#DC2626" }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#991B1B" }}>⚠️ Reset Tournament Database</h3>
                  <p style={{ fontSize: 12, color: "#991B1B", opacity: 0.8 }}>Action is Permanent & Irreversible</p>
                </div>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
                This will permanently delete <strong>ALL registrations</strong>, reset the registration counter to 0, delete all payment proof screenshots from Cloudinary, and start a fresh season.
              </p>

              {/* CSV Backup Option */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 20,
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={downloadBackup}
                    onChange={(e) => setDownloadBackup(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#DC2626", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>
                    Export CSV Backup before deletion (Recommended)
                  </span>
                </label>
              </div>

              {/* Confirmation Text Input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 8 }}>
                  TYPE <span style={{ color: "#DC2626", fontFamily: "monospace", fontSize: 13 }}>RESET</span> TO CONFIRM:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="RESET"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: confirmInput === "RESET" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    outline: "none",
                    background: "#FAFAFA",
                  }}
                />
              </div>

              {/* Live Progress Display */}
              {isResetting && (
                <div
                  style={{
                    padding: 12,
                    background: "#FFF1F2",
                    borderRadius: 10,
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#991B1B",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  <span>{progressText || "Executing reset..."}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => {
                    setIsModalOpen(false);
                    setConfirmInput("");
                  }}
                  style={{
                    padding: "11px 18px",
                    background: "#F1F5F9",
                    color: "#475569",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isResetting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={confirmInput.trim() !== "RESET" || isResetting}
                  onClick={handleExecuteReset}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 20px",
                    background: confirmInput.trim() === "RESET" && !isResetting ? "#DC2626" : "#FDA4AF",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: confirmInput.trim() === "RESET" && !isResetting ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isResetting ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {isResetting ? "Resetting..." : "Confirm & Reset Database"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
