"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDrawer } from "@/components/admin/AdminDrawer";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { useAdminStore } from "@/store/useAdminStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAdminStore();

  const desktopLeftOffset = sidebarCollapsed ? 72 : 250;

  return (
    <AdminGuard>
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "#F8FAFC",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top App Bar */}
        <AdminTopBar />

        {/* Mobile Slide-Out Drawer */}
        <AdminDrawer />

        {/* Main Body Container */}
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {/* Desktop Fixed Sidebar */}
          <AdminSidebar />

          {/* Main Content Area */}
          <div
            className="admin-main-wrapper"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              overflowX: "hidden",
            }}
          >
            <main
              style={{
                flex: 1,
                padding: "16px",
                paddingBottom: "84px",
                overflowY: "auto",
              }}
            >
              {children}
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <AdminBottomNav />
      </div>

      <style jsx global>{`
        /* Mobile-First Responsive Breakpoints */
        @media (min-width: 1024px) {
          .admin-mobile-only {
            display: none !important;
          }
          .admin-desktop-only {
            display: flex !important;
          }
          .admin-main-wrapper {
            margin-left: ${desktopLeftOffset}px;
            transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          main {
            padding: 24px !important;
            padding-bottom: 32px !important;
          }
        }

        @media (max-width: 1023px) {
          .admin-mobile-only {
            display: flex !important;
          }
          .admin-desktop-only {
            display: none !important;
          }
          .admin-main-wrapper {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </AdminGuard>
  );
}
