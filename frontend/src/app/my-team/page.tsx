"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Shield,
  Phone,
  Lock,
  Copy,
  Bell,
  CheckCircle2,
  AlertCircle,
  Zap,
  Upload,
  Loader2,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

interface RegistrationData {
  id: string;
  teamId: string;
  teamName: string;
  captain: { name: string; uid: string; gameName?: string };
  players: { name: string; uid: string; gameName?: string }[];
  substitute?: { name: string; uid: string; gameName?: string };
  phone: string;
  whatsapp: string;
  allocatedStage: string;
  qualificationStatus: "pending" | "qualified_round_2" | "eliminated" | "premium_pass_granted";
  registrationOrder: number;
}

interface NotificationItem {
  id: string;
  teamId: string;
  title: string;
  message: string;
  type: string;
  createdAt?: any;
}

interface MatchItem {
  id: string;
  name: string;
  map: string;
  round: string;
  matchTime: string;
  roomRevealTime?: string;
  status: string;
}

export default function MyTeamPage() {
  // Authentication State
  const [squadIdInput, setSquadIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Authenticated State
  const [activeSession, setActiveSession] = useState<{ squadId: string; phone: string } | null>(null);
  const [team, setTeam] = useState<RegistrationData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [allocatedMatch, setAllocatedMatch] = useState<MatchItem | null>(null);
  const [roomCreds, setRoomCreds] = useState<{ canView: boolean; roomId?: string; roomPassword?: string }>({
    canView: false,
  });

  // Future OTP Step state (ready for seamless OTP extension)
  const [authStep, setAuthStep] = useState<"credentials" | "otp" | "authenticated">("credentials");
  const [otpInput, setOtpInput] = useState("");

  // Premium Pass Form State
  const [showPremiumForm, setShowPremiumForm] = useState(false);
  const [premiumUpi, setPremiumUpi] = useState("");
  const [premiumScreenshot, setPremiumScreenshot] = useState("");
  const [uploadingScreen, setUploadingScreen] = useState(false);
  const [submittingPremium, setSubmittingPremium] = useState(false);

  // Auto-restore session from localStorage if present
  useEffect(() => {
    const savedSquadId = localStorage.getItem("og_auth_squad_id");
    const savedPhone = localStorage.getItem("og_auth_phone");

    if (savedSquadId && savedPhone) {
      setSquadIdInput(savedSquadId);
      setPhoneInput(savedPhone);
      verifyCredentials(savedSquadId, savedPhone, true);
    }
  }, []);

  // Server-side Two-Factor Authentication Verification
  const verifyCredentials = async (squadId: string, phone: string, isAutoRestore = false) => {
    setVerifying(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/team/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ squadId, phone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Invalid Squad ID or Captain Phone Number.");
        if (!isAutoRestore) {
          toast.error(data.error || "Invalid Squad ID or Captain Phone Number.");
        }
        localStorage.removeItem("og_auth_squad_id");
        localStorage.removeItem("og_auth_phone");
        setAuthStep("credentials");
        setActiveSession(null);
        setTeam(null);
        return;
      }

      // Authentication Success
      setActiveSession({ squadId: data.team.teamId, phone });
      setTeam(data.team);
      localStorage.setItem("og_auth_squad_id", data.team.teamId);
      localStorage.setItem("og_auth_phone", phone);
      setAuthStep("authenticated");
      if (!isAutoRestore) {
        toast.success(`Welcome back, Team ${data.team.teamName}! 🎉`);
      }
    } catch {
      setAuthError("Failed to connect to verification server.");
      if (!isAutoRestore) {
        toast.error("Failed to verify credentials.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadIdInput.trim() || !phoneInput.trim()) {
      setAuthError("Please enter both Squad ID and Captain Phone Number.");
      toast.error("Both Squad ID and Captain Phone Number are required.");
      return;
    }
    verifyCredentials(squadIdInput.trim(), phoneInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem("og_auth_squad_id");
    localStorage.removeItem("og_auth_phone");
    setActiveSession(null);
    setTeam(null);
    setAuthStep("credentials");
    setSquadIdInput("");
    setPhoneInput("");
    toast.success("Logged out of team dashboard.");
  };

  // Real-time Firestore Listeners for Authenticated Team
  useEffect(() => {
    if (!activeSession) return;

    const q = query(
      collection(db, "registrations"),
      where("teamId", "==", activeSession.squadId)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setTeam({ id: docSnap.id, ...docSnap.data() } as RegistrationData);
      }
    });

    const qNotif = query(collection(db, "notifications"), where("teamId", "==", activeSession.squadId));
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
      setNotifications(list);
    });

    return () => {
      unsub();
      unsubNotif();
    };
  }, [activeSession]);

  // Real-time Match Allocation & Secure Room Fetch
  useEffect(() => {
    if (!team) return;

    const qMatch = query(collection(db, "matches"), where("round", "==", team.allocatedStage));
    const unsubMatch = onSnapshot(qMatch, (snap) => {
      if (!snap.empty) {
        const mData = { id: snap.docs[0].id, ...snap.docs[0].data() } as MatchItem;
        setAllocatedMatch(mData);

        fetch(`/api/matches/${mData.id}/room`)
          .then((res) => res.json())
          .then((data) => setRoomCreds(data))
          .catch(() => {});
      }
    });

    return () => unsubMatch();
  }, [team]);

  // Upload Screenshot Handler for Premium Pass
  const handlePremiumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingScreen(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPremiumScreenshot(data.url);
        toast.success("Payment screenshot uploaded!");
      }
    } catch {
      toast.error("Failed to upload screenshot");
    } finally {
      setUploadingScreen(false);
    }
  };

  // Submit Premium Pass Handler
  const handlePremiumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !premiumUpi || !premiumScreenshot) {
      toast.error("Please enter UPI ID and upload payment proof screenshot.");
      return;
    }
    setSubmittingPremium(true);
    try {
      await addDoc(collection(db, "premiumEntries"), {
        teamId: team.teamId,
        teamName: team.teamName,
        captainName: team.captain.name,
        phone: team.phone,
        whatsapp: team.whatsapp,
        upiTransactionId: premiumUpi,
        screenshotUrl: premiumScreenshot,
        fee: 40,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        teamId: team.teamId,
        title: "Premium Pass Submitted",
        message: "Your ₹40 Premium Pass re-entry request has been submitted to Admin for Round 2 slot verification.",
        type: "premium_pass",
        createdAt: serverTimestamp(),
      });

      setShowPremiumForm(false);
      toast.success("Premium Pass submitted for Admin approval! ⚡");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit Premium Pass");
    } finally {
      setSubmittingPremium(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F6", fontFamily: "Inter, sans-serif", paddingTop: 130, paddingBottom: 80 }}>
      <div className="container-custom" style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* TWO-FACTOR TEAM VERIFICATION LOGIN CARD */}
        {authStep !== "authenticated" || !team ? (
          <div style={{ maxWidth: 460, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span className="badge badge-accent" style={{ marginBottom: 14 }}>
                🔒 2FA Squad Verification
              </span>
              <h1
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  color: "#111",
                  letterSpacing: "-0.03em",
                }}
              >
                Access Your Team Dashboard
              </h1>
              <p style={{ fontSize: 14, color: "#666", marginTop: 8, lineHeight: 1.5 }}>
                Enter your registered Squad ID and Captain Phone Number to verify ownership and access your match details.
              </p>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                border: "1.5px solid #E2E8F0",
                padding: 32,
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <form onSubmit={handleAuthSubmit}>
                {/* Field 1: Squad ID */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    SQUAD ID *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Shield size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. OG-VERIFIED(12)"
                      value={squadIdInput}
                      onChange={(e) => setSquadIdInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 44px",
                        borderRadius: 12,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 14,
                        color: "#0F172A",
                        outline: "none",
                        background: "#FAFAFA",
                        fontFamily: "monospace",
                        fontWeight: 700,
                      }}
                    />
                  </div>
                </div>

                {/* Field 2: Captain Phone Number */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    CAPTAIN PHONE NUMBER *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit Phone Number"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "13px 14px 13px 44px",
                        borderRadius: 12,
                        border: "1.5px solid #CBD5E1",
                        fontSize: 14,
                        color: "#0F172A",
                        outline: "none",
                        background: "#FAFAFA",
                      }}
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: 10,
                      padding: "10px 14px",
                      marginBottom: 20,
                      fontSize: 13,
                      color: "#DC2626",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={verifying}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    background: "#DC2626",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: verifying ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(220,38,38,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {verifying ? (
                    <>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED SQUAD DASHBOARD */
          <div>
            {/* Top Team Info Banner with Logout */}
            <div
              style={{
                background: "#1E293B",
                color: "#FFFFFF",
                borderRadius: 20,
                padding: 28,
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 6, background: "#DC2626", fontSize: 12, fontWeight: 800 }}>
                    {team.teamId}
                  </span>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>
                    Reg Order: #{team.registrationOrder || 1}
                  </span>
                </div>
                <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 28, fontWeight: 800 }}>
                  {team.teamName}
                </h2>
                <p style={{ fontSize: 13, color: "#CBD5E1", marginTop: 4 }}>
                  Captain: {team.captain.name} ({team.captain.uid}) • Phone: {team.phone}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
                    Match Allocation
                  </span>
                  <span style={{ padding: "6px 12px", borderRadius: 8, background: "#334155", border: "1px solid #475569", fontSize: 13, fontWeight: 800, color: "#38BDF8", marginTop: 2 }}>
                    📍 {team.allocatedStage}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout from Dashboard"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#334155",
                    color: "#F8FAFC",
                    border: "1px solid #475569",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <LogOut size={14} /> Exit
                </button>
              </div>
            </div>

            {/* Stage & Qualification Status Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Current Stage</span>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{team.allocatedStage}</h4>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{team.registrationOrder <= 12 ? "Teams 1-12 Pool" : "Teams 13-24 Pool"}</p>
              </div>

              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Qualification Status</span>
                <div style={{ marginTop: 6 }}>
                  {team.qualificationStatus === "pending" && (
                    <span style={{ padding: "6px 12px", borderRadius: 8, background: "#FEF3C7", color: "#D97706", fontSize: 13, fontWeight: 800 }}>
                      ⏳ Pending Match Result
                    </span>
                  )}
                  {team.qualificationStatus === "qualified_round_2" && (
                    <span style={{ padding: "6px 12px", borderRadius: 8, background: "#DCFCE7", color: "#16A34A", fontSize: 13, fontWeight: 800 }}>
                      🎉 Qualified for Round 2!
                    </span>
                  )}
                  {team.qualificationStatus === "eliminated" && (
                    <span style={{ padding: "6px 12px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626", fontSize: 13, fontWeight: 800 }}>
                      ❌ Eliminated in Qualifier
                    </span>
                  )}
                  {team.qualificationStatus === "premium_pass_granted" && (
                    <span style={{ padding: "6px 12px", borderRadius: 8, background: "#F3E8FF", color: "#7E22CE", fontSize: 13, fontWeight: 800 }}>
                      ⚡ Premium Pass Granted (Round 2)
                    </span>
                  )}
                </div>
              </div>

              {/* Only Goats Premium Pass Entry Status */}
              <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Only Goats Premium Pass</span>
                <div style={{ marginTop: 6 }}>
                  {team.qualificationStatus === "eliminated" ? (
                    <button
                      onClick={() => setShowPremiumForm(true)}
                      style={{ padding: "8px 14px", borderRadius: 8, background: "#7E22CE", color: "#FFF", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      ⚡ Apply Premium Pass (₹40)
                    </button>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>
                      {team.qualificationStatus === "qualified_round_2" ? "Not Needed (Qualified)" : "Locked"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Room Credentials Box (Secured Auto Reveal) */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                  🎮 Room Credentials & Match Details
                </h3>
                {allocatedMatch && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>
                    Match: {allocatedMatch.name}
                  </span>
                )}
              </div>

              {roomCreds.canView ? (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 16, padding: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#15803D", marginBottom: 12 }}>
                    ✅ ROOM CREDENTIALS UNLOCKED
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "#FFFFFF", padding: 12, borderRadius: 10, border: "1px solid #DCFCE7" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D" }}>ROOM ID</span>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                        <strong style={{ fontSize: 16, fontFamily: "monospace" }}>{roomCreds.roomId}</strong>
                        <button onClick={() => { navigator.clipboard.writeText(roomCreds.roomId!); toast.success("Room ID Copied!"); }} style={{ background: "none", border: "none", color: "#16A34A", cursor: "pointer" }}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ background: "#FFFFFF", padding: 12, borderRadius: 10, border: "1px solid #DCFCE7" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D" }}>PASSWORD</span>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                        <strong style={{ fontSize: 16, fontFamily: "monospace" }}>{roomCreds.roomPassword}</strong>
                        <button onClick={() => { navigator.clipboard.writeText(roomCreds.roomPassword!); toast.success("Password Copied!"); }} style={{ background: "none", border: "none", color: "#16A34A", cursor: "pointer" }}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                    <Lock size={16} /> 🔒 Room Details are Locked
                  </div>
                  <p style={{ fontSize: 13, color: "#64748B" }}>
                    Room ID & Password will automatically unlock exactly <strong>10 minutes before match start time</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Premium Pass Modal */}
            {showPremiumForm && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                <div style={{ background: "#FFFFFF", borderRadius: 20, maxWidth: 480, width: "100%", padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#7E22CE", marginBottom: 8 }}>
                    ⚡ Only Goats Premium Pass (₹40 Re-entry)
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                    Re-enter the tournament for Round 2. Admin approves the Top 4 Premium Entries.
                  </p>

                  <form onSubmit={handlePremiumSubmit}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>UPI TRANSACTION ID *</label>
                      <input type="text" required placeholder="Enter UPI Trans ID" value={premiumUpi} onChange={(e) => setPremiumUpi(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1" }} />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>PAYMENT SCREENSHOT (₹40) *</label>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "#F1F5F9", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {uploadingScreen ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                        {uploadingScreen ? "Uploading..." : "Upload Proof"}
                        <input type="file" accept="image/*" onChange={handlePremiumUpload} style={{ display: "none" }} />
                      </label>
                      {premiumScreenshot && <span style={{ fontSize: 12, color: "#16A34A", marginLeft: 10 }}>Uploaded!</span>}
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => setShowPremiumForm(false)} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#F1F5F9", fontSize: 13, fontWeight: 600 }}>Cancel</button>
                      <button type="submit" disabled={submittingPremium || !premiumScreenshot} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#7E22CE", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        {submittingPremium ? "Submitting..." : "Submit Premium Pass"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications Feed */}
            <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={18} style={{ color: "#DC2626" }} /> Real-time Activity Notifications
              </h3>
              {notifications.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94A3B8" }}>No notifications yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: 12, padding: 14 }}>
                      <strong style={{ fontSize: 13, color: "#0F172A", display: "block" }}>{n.title}</strong>
                      <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
