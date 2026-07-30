"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { Save, Settings, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DangerZoneCard } from "@/components/admin/DangerZoneCard";

export default function SettingsPage() {
  const [form, setForm] = useState({
    tournamentName: "Only Goats FF Tournament",
    heroTitle: "BATTLE. SURVIVE. CHAMPION.",
    heroSubtitle: "Join the ultimate Free Fire tournament",
    entryFee: 100, reEntryFee: 40, prizePool: 1000,
    maxTeams: 24, countdownDate: "2026-08-08T23:00",
    registrationOpen: true,
    primaryCTA: "Register Team", secondaryCTA: "View Rules",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "tournament"), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setForm(f => ({
          ...f,
          tournamentName: d.tournamentName || f.tournamentName,
          heroTitle: d.heroTitle || f.heroTitle,
          heroSubtitle: d.heroSubtitle || f.heroSubtitle,
          entryFee: d.entryFee || f.entryFee,
          reEntryFee: d.reEntryFee || f.reEntryFee,
          prizePool: d.prizePool || f.prizePool,
          maxTeams: d.maxTeams || f.maxTeams,
          countdownDate: d.countdownDate || f.countdownDate,
          registrationOpen: d.registrationOpen ?? f.registrationOpen,
          primaryCTA: d.primaryCTA || f.primaryCTA,
          secondaryCTA: d.secondaryCTA || f.secondaryCTA,
        }));
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "settings", "tournament"), { ...form, updatedAt: serverTimestamp() });
      toast.success("Tournament settings saved!");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "Inter, sans-serif", background: "#FAFAFA", transition: "border-color 0.15s" } as React.CSSProperties;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>{title}</h3>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em", fontFamily: "Inter, sans-serif" }}>{label}</label>
      {children}
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #E2E8F0", borderTopColor: "#EF4444", borderRadius: "50%", animation: "tspin 0.8s linear infinite" }} />
      <style>{`@keyframes tspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Tournament Settings</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Configure your tournament details, fees, and registration</p>
      </div>

      <form onSubmit={handleSave}>
        <Section title="Tournament Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Tournament Name">
              <input value={form.tournamentName} onChange={e => setForm(f => ({ ...f, tournamentName: e.target.value }))} style={inp}
                onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <Field label="Countdown Date">
              <input type="datetime-local" value={form.countdownDate} onChange={e => setForm(f => ({ ...f, countdownDate: e.target.value }))} style={inp}
                onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Hero Title">
                <input value={form.heroTitle} onChange={e => setForm(f => ({ ...f, heroTitle: e.target.value }))} style={inp}
                  onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Field label="Hero Subtitle">
                <input value={form.heroSubtitle} onChange={e => setForm(f => ({ ...f, heroSubtitle: e.target.value }))} style={inp}
                  onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Fees & Prize">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { key: "entryFee", label: "Entry Fee (₹)" },
              { key: "reEntryFee", label: "Re-Entry Fee (₹)" },
              { key: "prizePool", label: "Prize Pool (₹)" },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <input type="number" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} style={inp} min={0}
                  onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </Field>
            ))}
          </div>
        </Section>

        <Section title="Registration">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Maximum Teams">
              <input type="number" value={form.maxTeams} onChange={e => setForm(f => ({ ...f, maxTeams: parseInt(e.target.value) || 0 }))} style={inp} min={1}
                onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <Field label="Registration Status">
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div
                    onClick={() => setForm(f => ({ ...f, registrationOpen: !f.registrationOpen }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, position: "relative",
                      background: form.registrationOpen ? "#22C55E" : "#E2E8F0",
                      transition: "background 0.2s", cursor: "pointer",
                    }}>
                    <div style={{
                      position: "absolute", top: 2, left: form.registrationOpen ? 22 : 2,
                      width: 20, height: 20, borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: form.registrationOpen ? "#22C55E" : "#64748B" }}>
                    {form.registrationOpen ? "Open" : "Closed"}
                  </span>
                </label>
              </div>
            </Field>
          </div>
        </Section>

        <Section title="CTA Buttons">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Primary CTA">
              <input value={form.primaryCTA} onChange={e => setForm(f => ({ ...f, primaryCTA: e.target.value }))} style={inp}
                onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
            <Field label="Secondary CTA">
              <input value={form.secondaryCTA} onChange={e => setForm(f => ({ ...f, secondaryCTA: e.target.value }))} style={inp}
                onFocus={e => e.target.style.borderColor = "#EF4444"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </Field>
          </div>
        </Section>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
          <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", background: saving ? "#F87171" : "#EF4444", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}>
            {saving ? <Loader2 size={16} style={{ animation: "tspin 0.8s linear infinite" }} /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Danger Zone Section */}
      <DangerZoneCard />
    </div>
  );
}
