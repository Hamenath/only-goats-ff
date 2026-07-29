"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admins", user.uid));
        if (snap.exists() && (snap.data().role === "super-admin" || snap.data().role === "superadmin" || snap.data().role === "admin")) {
          setStatus("authorized");
        } else {
          router.replace("/admin/unauthorized");
        }
      } catch {
        router.replace("/admin/unauthorized");
      }
    });
    return () => unsub();
  }, [router]);

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F8FAFC"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid #E2E8F0",
            borderTopColor: "#EF4444", borderRadius: "50%",
            animation: "admin-spin 0.8s linear infinite", margin: "0 auto 12px"
          }} />
          <p style={{ color: "#64748B", fontSize: 14, fontFamily: "Inter, sans-serif" }}>
            Verifying access...
          </p>
        </div>
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "unauthorized") return null;

  return <>{children}</>;
}
