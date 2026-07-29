"use client";

import Link from "next/link";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F8FAFC", fontFamily: "Inter, sans-serif", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: "#FEE2E2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <ShieldOff size={32} color="#DC2626" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
          Access Denied
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 28 }}>
          You don't have permission to access the admin panel. 
          Contact a super-admin to grant you access.
        </p>
        <Link href="/admin" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", background: "#EF4444", color: "#fff",
          borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600,
        }}>
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
