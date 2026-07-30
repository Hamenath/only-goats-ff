"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, increment, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { Check, Upload, ChevronRight, User, Users, CreditCard, Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import confetti from "canvas-confetti";

// Zod schema
const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  uid: z.string().min(8, "UID must be 8 to 11 characters").max(11, "UID must be 8 to 11 characters"),
  gameName: z.string().min(2, "Game name required"),
});

const formSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters").max(30, "Team name too long"),
  captain: playerSchema,
  players: z.array(playerSchema).length(3, "Exactly 3 additional players required"),
  substitute: z.object({
    name: z.string().optional(),
    uid: z.string().refine((val) => !val || (val.trim().length >= 8 && val.trim().length <= 11), {
      message: "Substitute UID must be 8 to 11 characters",
    }).optional(),
    gameName: z.string().optional(),
  }),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Phone number must be exactly 10 digits"),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, "WhatsApp number must be exactly 10 digits"),
  upiTransactionId: z.string().min(6, "Enter valid UPI transaction ID"),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, title: "Captain Details", icon: User },
  { id: 2, title: "Squad Setup", icon: Users },
  { id: 3, title: "UPI Payment", icon: CreditCard },
];

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

function InputField({ label, error, touched, ...props }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value !== undefined && props.value !== "";

  return (
    <div style={{ marginBottom: 24, position: "relative" }}>
      <div
        style={{
          border: `1px solid ${error ? "#e50914" : focused ? "#111" : "#eaeaea"}`,
          borderRadius: 14,
          padding: "16px 18px",
          background: "#fff",
          transition: "all 0.2s ease",
          boxShadow: focused ? "0 4px 18px rgba(0,0,0,0.02)" : "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 18,
            top: focused || hasValue ? 8 : 20,
            fontSize: focused || hasValue ? 10 : 13,
            fontWeight: 700,
            color: error ? "#e50914" : focused ? "#111" : "#888",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            pointerEvents: "none",
            transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {label}
        </span>
        <input
          {...props}
          className={`clean-input ${props.className || ""}`}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            boxShadow: "none",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "Inter, sans-serif",
            color: "#111",
            marginTop: focused || hasValue ? 10 : 0,
            ...props.style,
          }}
        />
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "#e50914", marginTop: 6, marginLeft: 6, fontWeight: 600 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    teamId: string;
    teamName: string;
    captainName: string;
    captainUid: string;
    phone: string;
    whatsapp: string;
    upiTransactionId: string;
    screenshotUrl: string;
  } | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeTournament, setActiveTournament] = useState<Record<string, unknown> | null>(null);
  const [checkingActive, setCheckingActive] = useState(true);

  // Real-time Active Tournament listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "activeTournament"), (snap) => {
      if (snap.exists()) {
        const activeId = snap.data().activeTournamentId;
        if (activeId) {
          onSnapshot(doc(db, "tournaments", activeId), (tSnap) => {
            if (tSnap.exists()) {
              setActiveTournament({ id: tSnap.id, ...tSnap.data() });
            } else {
              setActiveTournament(null);
            }
            setCheckingActive(false);
          });
        } else {
          setActiveTournament(null);
          setCheckingActive(false);
        }
      } else {
        setActiveTournament(null);
        setCheckingActive(false);
      }
    });
    return () => unsub();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, touchedFields },
    trigger,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      players: [
        { name: "", uid: "", gameName: "" },
        { name: "", uid: "", gameName: "" },
        { name: "", uid: "", gameName: "" },
      ],
    },
  });

  const { fields } = useFieldArray({ control, name: "players" });

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFileError("Please upload a valid screenshot image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Screenshot must be under 5MB");
      return;
    }
    setFileError("");
    setPaymentFile(file);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const nextStep = async () => {
    let valid = false;
    if (step === 1) {
      valid = await trigger(["teamName", "captain.name", "captain.uid", "captain.gameName", "phone", "whatsapp"]);
    } else if (step === 2) {
      valid = await trigger(["players"]);
    }
    if (valid) setStep((s) => s + 1);
  };

  const fireConfetti = () => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ["#e50914", "#111", "#FFD700"] });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#e50914", "#fff"] }), 300);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#111", "#FFD700"] }), 500);
  };

  const onSubmit = async (data: FormData) => {
    if (!paymentFile) {
      setFileError("Upload payment proof screenshot to finish");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Confirming transaction...");

    try {
      // Get current registration count for sequential non-repeating OG-VERIFIED(X)
      const countRef = doc(db, "settings", "registrationCount");
      const countSnap = await getDoc(countRef);
      let currentCount = 0;
      if (countSnap.exists()) {
        currentCount = countSnap.data().count || 0;
      }
      const nextCount = currentCount + 1;
      const teamId = `OG-VERIFIED(${nextCount})`;

      // Upload file to Cloudinary via secure serverless API route
      const uploadFormData = new FormData();
      uploadFormData.append("file", paymentFile);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || uploadResult.error) {
        throw new Error(uploadResult.error || "Failed to upload payment screenshot");
      }
      const screenshotUrl = uploadResult.url;

      // Fetch Active Tournament Settings for Dynamic Allocation
      let activeTournId = "og-season-1";
      let teamsPerQual = 12;
      try {
        const activeSnap = await getDoc(doc(db, "settings", "activeTournament"));
        if (activeSnap.exists()) {
          activeTournId = activeSnap.data().activeTournamentId || "og-season-1";
          const tournSnap = await getDoc(doc(db, "tournaments", activeTournId));
          if (tournSnap.exists()) {
            teamsPerQual = tournSnap.data().teamsPerQualifier || 12;
          }
        }
      } catch {}

      const qualNum = Math.ceil(currentCount / teamsPerQual) || 1;
      const allocatedStage = `Qualifier ${qualNum}`;

      // Save registration with Dynamic Multi-Tournament Allocation
      await addDoc(collection(db, "registrations"), {
        tournamentId: activeTournId,
        teamId,
        teamName: data.teamName,
        captain: data.captain,
        players: data.players,
        substitute: data.substitute,
        phone: data.phone,
        whatsapp: data.whatsapp,
        upiTransactionId: data.upiTransactionId,
        paymentScreenshotUrl: screenshotUrl,
        status: "pending",
        registrationOrder: currentCount,
        allocatedStage,
        qualificationStatus: "pending",
        createdAt: serverTimestamp(),
      });

      // Update count
      if (countSnap.exists()) {
        await setDoc(countRef, { count: increment(1) }, { merge: true });
      } else {
        await setDoc(countRef, { count: 1 });
      }

      // Create Automated Real-time Allocation Notification
      try {
        await addDoc(collection(db, "notifications"), {
          teamId,
          title: `Allocated to ${allocatedStage}`,
          message: `Welcome! Team ${data.teamName} (${teamId}) has been automatically allocated to ${allocatedStage}.`,
          type: "allocation",
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch {}

      toast.success("Successfully registered! See you in the lobby. 🎉", { id: toastId });
      setSuccess({
        teamId,
        teamName: data.teamName,
        captainName: data.captain.name,
        captainUid: data.captain.uid,
        phone: data.phone,
        whatsapp: data.whatsapp,
        upiTransactionId: data.upiTransactionId,
        screenshotUrl,
      });
      fireConfetti();
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch inputs for labels floating state check
  const watchedValues = watch();

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(229,9,20,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}
        >
          <Check size={36} style={{ color: "#e50914" }} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 32, fontWeight: 800, color: "#111", marginBottom: 12 }}>
          Lobby Confirmed
        </h2>
        <p style={{ fontSize: 15, color: "#666", marginBottom: 32 }}>
          Your slot is reserved. Payment is under verification.
        </p>

        <div className="glass-card" style={{ maxWidth: 400, margin: "0 auto 24px", padding: "24px 28px", textAlign: "left", border: "1px solid #111" }}>
          <p style={{ fontSize: 10, color: "#999", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            YOUR SQUAD ID
          </p>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 28, fontWeight: 800, color: "#e50914", letterSpacing: "-0.02em" }}>
            {success.teamId}
          </p>
          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Room invite and verification status will reference this ID.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginBottom: 24 }}>
          {/* Join Official WhatsApp Group */}
          <a
            href="https://chat.whatsapp.com/FeeiKNO0jeBCa0LKOa8iMZ?s=sh&p=a&mlu=4&amv=2"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "14px 28px",
              borderRadius: 14,
              background: "#25D366",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(37,211,102,0.3)",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <MessageCircle size={18} />
            <span>Join Official WhatsApp Group</span>
          </a>
        </div>

        <p style={{ fontSize: 13, color: "#888", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          A confirmation WhatsApp will be sent within 24 hours to your captain.
        </p>
      </div>
    );
  }

  if (!checkingActive && (!activeTournament || activeTournament.status === "cancelled")) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", background: "#FFFFFF", borderRadius: 24, border: "1.5px solid #E2E8F0", maxWidth: 540, margin: "0 auto", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#DC2626", fontSize: 28 }}>
          🏆
        </div>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>
          No Active Tournament
        </h2>
        <p style={{ fontSize: 15, color: "#64748B", maxWidth: 380, margin: "0 auto" }}>
          Stay tuned for upcoming tournaments.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Steps header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 48 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: step >= s.id ? (step === s.id ? "#111" : "#e50914") : "#fafafa",
                  border: `1.5px solid ${step >= s.id ? "transparent" : "#eaeaea"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: step === s.id ? "0 4px 16px rgba(17,17,17,0.12)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {step > s.id ? (
                  <Check size={16} color="#fff" strokeWidth={2.5} />
                ) : (
                  <s.icon size={16} color={step >= s.id ? "#fff" : "#bbb"} />
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: step >= s.id ? "#111" : "#bbb", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {s.title}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: 60,
                  height: 2,
                  background: step > s.id ? "#e50914" : "#eaeaea",
                  margin: "0 10px",
                  marginBottom: 20,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Captain + Team */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 28, color: "#111" }}>
              Squad Leader Credentials
            </h3>
            <InputField
              label="Team Name *"
              placeholder=""
              {...register("teamName")}
              error={errors.teamName?.message}
              value={watchedValues.teamName ?? ""}
            />
            <div className="form-grid-2">
              <InputField
                label="Captain Name *"
                placeholder=""
                {...register("captain.name")}
                error={errors.captain?.name?.message}
                value={watchedValues.captain?.name ?? ""}
              />
              <InputField
                label="Captain UID *"
                placeholder=""
                {...register("captain.uid")}
                error={errors.captain?.uid?.message}
                value={watchedValues.captain?.uid ?? ""}
              />
            </div>
            <InputField
              label="Captain Free Fire In-Game Name *"
              placeholder=""
              {...register("captain.gameName")}
              error={errors.captain?.gameName?.message}
              value={watchedValues.captain?.gameName ?? ""}
            />
            <div className="form-grid-2">
              <InputField
                label="Phone Number *"
                placeholder=""
                type="tel"
                maxLength={10}
                {...register("phone")}
                error={errors.phone?.message}
                value={watchedValues.phone ?? ""}
              />
              <InputField
                label="WhatsApp Number *"
                placeholder=""
                type="tel"
                maxLength={10}
                {...register("whatsapp")}
                error={errors.whatsapp?.message}
                value={watchedValues.whatsapp ?? ""}
              />
            </div>
          </div>
        )}

        {/* Step 2: Squad members */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 24, color: "#111" }}>
              Additional Squad Roster
            </h3>
            {fields.map((field, i) => (
              <div key={field.id} style={{ marginBottom: 24, padding: "20px", background: "#fafafa", borderRadius: 16, border: "1px solid #eaeaea" }}>
                <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 800, color: "#e50914", marginBottom: 16, letterSpacing: "0.05em" }}>
                  PLAYER 0{i + 2}
                </p>
                <div className="form-grid-2">
                  <InputField
                    label="Full Name *"
                    placeholder=""
                    {...register(`players.${i}.name`)}
                    error={errors.players?.[i]?.name?.message}
                    value={watchedValues.players?.[i]?.name ?? ""}
                  />
                  <InputField
                    label="UID *"
                    placeholder=""
                    {...register(`players.${i}.uid`)}
                    error={errors.players?.[i]?.uid?.message}
                    value={watchedValues.players?.[i]?.uid ?? ""}
                  />
                </div>
                <InputField
                  label="In-Game Name *"
                  placeholder=""
                  {...register(`players.${i}.gameName`)}
                  error={errors.players?.[i]?.gameName?.message}
                  value={watchedValues.players?.[i]?.gameName ?? ""}
                />
              </div>
            ))}

            {/* Optional Substitute */}
            <div style={{ padding: "20px", background: "#fafafa", borderRadius: 16, border: "1px dashed #eaeaea" }}>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 800, color: "#999", marginBottom: 16, letterSpacing: "0.05em" }}>
                SUBSTITUTE PLAYER (OPTIONAL)
              </p>
              <div className="form-grid-2">
                <InputField
                  label="Full Name"
                  placeholder=""
                  {...register("substitute.name")}
                  value={watchedValues.substitute?.name ?? ""}
                />
                <InputField
                  label="UID"
                  placeholder=""
                  {...register("substitute.uid")}
                  error={errors.substitute?.uid?.message}
                  value={watchedValues.substitute?.uid ?? ""}
                />
              </div>
              <InputField
                label="In-Game Name"
                placeholder=""
                {...register("substitute.gameName")}
                value={watchedValues.substitute?.gameName ?? ""}
              />
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111" }}>
              Secure Payment Node
            </h3>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 28 }}>
              Pay the entry fee via UPI, then upload your digital receipt.
            </p>

            {/* Payment Grid: Left (QR Code), Center (UPI Address), Right (Payment Receipt Upload) */}
            {/* 1. Top Row: UPI Address & Amount Due */}
            <div
              style={{
                background: "rgba(229,9,20,0.02)",
                border: "1px solid rgba(229,9,20,0.12)",
                borderRadius: 18,
                padding: "20px 24px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 200, textAlign: "left" }}>
                <p style={{ fontSize: 10, color: "#999", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  UPI ADDRESS
                </p>
                <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, fontWeight: 800, color: "#e50914", wordBreak: "break-all" }}>
                  hamenathmurali@oksbi
                </p>
              </div>

              <div style={{ width: 1, height: 44, borderLeft: "1px dashed rgba(229,9,20,0.2)" }} />

              <div style={{ minWidth: 100, textAlign: "right" }}>
                <p style={{ fontSize: 10, color: "#999", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  AMOUNT DUE
                </p>
                <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 32, fontWeight: 800, color: "#111" }}>
                  ₹100
                </p>
              </div>
            </div>

            {/* 2. Middle Row: Dedicated Large QR Code Card */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #eaeaea",
                borderRadius: 20,
                padding: "24px 28px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
              }}
            >
              <p style={{ fontSize: 11, color: "#e50914", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                SCAN QR CODE TO PAY
              </p>
              <div style={{
                background: "#fff",
                padding: 12,
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                marginBottom: 14,
                display: "inline-block",
              }}>
                <img
                  src="/bhai-qr.jpeg"
                  alt="Hamenath B UPI QR Code"
                  style={{
                    width: 220,
                    height: "auto",
                    borderRadius: 10,
                    display: "block",
                  }}
                />
              </div>
              <p style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
                Scan using Google Pay, PhonePe, Paytm or any UPI app
              </p>
            </div>

            {/* Payment Receipt Image Upload */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#555", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Payment Receipt Image *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "28px 16px",
                  minHeight: 180,
                  border: `2px dashed ${fileError ? "#e50914" : isDragActive ? "#111" : paymentFile ? "#111" : "#eaeaea"}`,
                  borderRadius: 16,
                  cursor: "pointer",
                  background: paymentFile ? "rgba(17,17,17,0.01)" : isDragActive ? "rgba(17,17,17,0.02)" : "#fafafa",
                  transition: "all 0.2s ease",
                }}
                onClick={() => document.getElementById("file-upload-input")?.click()}
              >
                <input
                    id="payment-screenshot-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="payment-screenshot-input" style={{ width: "100%", height: "100%", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    {paymentFile ? (
                      <>
                        <Check size={28} style={{ color: "#111", marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#111", wordBreak: "break-all" }}>{paymentFile.name}</p>
                        <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>File ready · Click or drag to replace</p>
                      </>
                    ) : (
                      <>
                        <Upload size={28} style={{ color: "#999", marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#666" }}>Drag & Drop Payment receipt here</p>
                        <p style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>Or click to open file explorer (PNG, JPG, Max 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
                {fileError && (
                  <p style={{ fontSize: 11, color: "#e50914", marginTop: 6, fontWeight: 600 }}>{fileError}</p>
                )}
              </div>

            <InputField
              label="UPI Transaction ID *"
              placeholder=""
              {...register("upiTransactionId")}
              error={errors.upiTransactionId?.message}
              value={watchedValues.upiTransactionId ?? ""}
            />
          </div>
        )}

        {/* Form Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid #eaeaea" }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                fontSize: 14,
                borderRadius: 10,
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                fontSize: 14,
                borderRadius: 10,
              }}
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent"
              style={{
                minWidth: 180,
                opacity: isSubmitting ? 0.75 : 1,
                padding: "12px 28px",
                fontSize: 14,
                borderRadius: 10,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isSubmitting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
              <span>{isSubmitting ? "Confirming..." : "Complete Registration"}</span>
            </button>
          )}
        </div>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
