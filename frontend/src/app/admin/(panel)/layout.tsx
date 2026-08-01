"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopNav } from "@/components/admin/AdminTopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          <AdminTopNav />
          <main
            className="admin-main-container"
            style={{
              flex: 1,
              maxWidth: 1600,
              width: "100%",
              margin: "0 auto",
              padding: "32px",
              boxSizing: "border-box",
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
