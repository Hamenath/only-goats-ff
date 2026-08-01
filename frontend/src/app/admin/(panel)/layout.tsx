"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{
        display: "flex", minHeight: "100vh", background: "#F8FAFC",
        fontFamily: "Inter, sans-serif",
      }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          <main style={{ flex: 1, padding: "24px", overflowX: "hidden", overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
