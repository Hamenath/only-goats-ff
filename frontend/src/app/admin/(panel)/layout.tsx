"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopNav } from "@/components/admin/AdminTopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{ display: "flex", minHeight: "100vh", width: "100%", maxWidth: "100%", overflowX: "hidden", background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
          <AdminTopNav />
          <main
            className="admin-main-container w-full max-w-full overflow-x-hidden p-4 md:p-8"
            style={{
              flex: 1,
              maxWidth: 1600,
              width: "100%",
              margin: "0 auto",
              boxSizing: "border-box",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
