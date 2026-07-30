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
  doc,
  getDocs,
} from "firebase/firestore";
import {
  Shield,
  Users,
  Trophy,
  Lock,
  Copy,
  Radio,
  Bell,
  CheckCircle2,
  AlertCircle,
  Zap,
  Upload,
  Loader2,
  Search,
  Check,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [team, setTeam] = useState<RegistrationData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [allocatedMatch, setAllocatedMatch] = useState<MatchItem | null>(null);
  const [roomCreds, setRoomCreds] = useState<{ canView: boolean; roomId?: string; roomPassword?: string }>({
    canView: false,
  });

  // Premium Pass Form State
  const [showPremiumForm, setShowPremiumForm] = useState(false);
  const [premiumUpi, setPremiumUpi] = useState("");
  const [premiumScreenshot, setPremiumScreenshot] = useState("");
  const [uploadingScreen, setUploadingScreen] = useState(false);
  const [submittingPremium, setSubmittingPremium] = useState(false);
  const [hasSubmittedPremium, setHasSubmittedPremium] = useState(false);

  // Load from localStorage if previously searched
  useEffect(() => {
    const saved = localStorage.getItem("og_team_id");
    if (saved) {
      setActiveTeamId(saved);
      setSearchQuery(saved);
    }
  }, []);

  // Real-time Firestore Subscription for Team Registration
  useEffect(() => {
    if (!activeTeamId) return;

    const q = query(
      collection(db, "registrations"),
      where("teamId", "==", activeTeamId.trim())
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() } as RegistrationData;
        setTeam(data);
        localStorage.setItem("og_team_id", data.teamId);
      } else {
        // Fallback search by phone number
        const qPhone = query(collection(db, "registrations"), where("phone", "==", activeTeamId.trim()));
        getDocs(qPhone).then((phoneSnap) => {
          if (!phoneSnap.empty) {
            const data = { id: phoneSnap.docs[0].id, ...phoneSnap.docs[0].data() } as RegistrationData;
            setTeam(data);
            localStorage.setItem("og_team_id", data.teamId);
          }
        });
      }
    });

    // Real-time Notifications Subscription for Team
    const qNotif = query(collection(db, "notifications"), where("teamId", "==", activeTeamId.trim()));
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
      setNotifications(list);
    });

    return () => {
      unsub();
      unsubNotif();
    };
  }, [activeTeamId]);

  // Real-time Match Allocation & Secure Room Fetch
  useEffect(() => {
    if (!team) return;

    const qMatch = query(collection(db, "matches"), where("round", "==", team.allocatedStage));
    const unsubMatch = onSnapshot(qMatch, (snap) => {
      if (!snap.empty) {
        const mData = { id: snap.docs[0].id, ...snap.docs[0].data() } as MatchItem;
        setAllocatedMatch(mData);

        // Fetch secure Room API endpoint
        fetch(`/api/matches/${mData.id}/room`)
          .then((res) => res.json())
          .then((data) => setRoomCreds(data))
          .catch(() => {});
      }
    });

    return () => unsubMatch();
  }, [team]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveTeamId(searchQuery.trim());
  };

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

      // Notification
      await addDoc(collection(db, "notifications"), {
        teamId: team.teamId,
        title: "Premium Pass Submitted",
        message: "Your ₹40 Premium Pass re-entry request has been submitted to Admin for Round 2 slot verification.",
        type: "premium_pass",
        createdAt: serverTimestamp(),
      });

      setHasSubmittedPremium(true);
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
        
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="badge badge-accent" style={{ marginBottom: 14 }}>
            🎮 Player Dashboard
          </span>
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.03em",
            }}
          >
            My Squad Dashboard & Match Hub
          </h1>
          <p style={{ fontSize: 15, color: "#666", marginTop: 8 }}>
            Real-time match stage allocation, 10-minute auto room reveal, qualification status, and notifications.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: 500, margin: "24px auto 0", display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Enter Squad ID (e.g. OG-VERIFIED(1)) or Phone Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: 12,
                border: "1.5px solid #E2E8F0",
                fontSize: 14,
                outline: "none",
                background: "#FFFFFF",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "14px 24px",
                background: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Dashboard Content */}
        {!team ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0" }}>
            <Shield size={44} style={{ color: "#CBD5E1", marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
              Enter your Squad ID above to load your live dashboard
            </h3>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
              Your Squad ID is displayed on your registration confirmation screen (e.g. OG-VERIFIED(1)).
            </p>
          </div>
        ) : (
          <div>
            {/* Top Team Info Banner */}
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

              {/* Status Badges */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
                  Automated Match Allocation
                </div>
                <div style={{ padding: "8px 16px", borderRadius: 10, background: "#334155", border: "1px solid #475569", fontSize: 14, fontWeight: 800, color: "#38BDF8" }}>
                  📍 {team.allocatedStage}
                </div>
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

            {/* Premium Pass Registration Form Modal */}
            {showPremiumForm && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                <div style={{ background: "#FFFFFF", borderRadius: 20, maxWidth: 480, width: "100%", padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#7E22CE", marginBottom: 8 }}>
                    ⚡ Only Goats Premium Pass (₹40 Re-entry)
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                    Re-enter the tournament for Round 2. Admin approves the Top 4 Premium Entries (Total 16 Teams = 12 Qualified + 4 Premium Pass).
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
