"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopNav } from "@/components/admin/AdminTopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex flex-col md:flex-row min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] font-sans">
        <AdminSidebar />
        {/* Mobile Header Spacer */}
        <div className="h-16 md:hidden flex-shrink-0 w-full" aria-hidden="true" />
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
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
