"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopNav } from "@/components/admin/AdminTopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="admin-theme h-dvh max-h-dvh w-full max-w-full overflow-hidden flex flex-col md:flex-row bg-[#F8FAFC]" style={{ fontFamily: "Inter, -apple-system, sans-serif" }}>
        <AdminSidebar />
        {/* Mobile Header Spacer */}
        <div className="h-[72px] md:hidden flex-shrink-0 w-full" aria-hidden="true" />
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full h-dvh max-h-dvh overflow-hidden relative">
          <AdminTopNav />
          <main
            className="admin-main-container flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden"
            style={{
              padding: "24px 28px",
              maxWidth: 1600,
              margin: "0 auto",
              boxSizing: "border-box",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
