"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDrawer } from "@/components/admin/AdminDrawer";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { useAdminStore } from "@/store/useAdminStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, theme } = useAdminStore();

  const isDark = theme === "dark";
  const desktopLeftOffset = sidebarCollapsed ? 80 : 270;

  return (
    <AdminGuard>
      <div
        style={{
          minHeight: "100vh",
          background: isDark ? "#020617" : "#F8FAFC",
          color: isDark ? "#F8FAFC" : "#334155",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
          transition: "background 0.25s ease, color 0.25s ease",
        }}
      >
        {/* Top App Bar (72px) */}
        <AdminTopBar />

        {/* Mobile Slide Drawer (0–768px) */}
        <AdminDrawer />

        {/* Main Body Layout */}
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {/* Desktop Collapsible Sidebar (270px / 80px) */}
          <AdminSidebar />

          {/* Main Workspace Container */}
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
                padding: "32px",
                paddingBottom: "96px",
                maxWidth: 1600,
                width: "100%",
                margin: "0 auto",
              }}
            >
              {children}
            </main>
          </div>
        </div>

        {/* Mobile Bottom Thumb Navigation */}
        <AdminBottomNav />
      </div>

      <style jsx global>{`
        /* Responsive Breakpoints & Desktop Sidebar Offset */
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
            padding: 32px !important;
            padding-bottom: 40px !important;
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
          main {
            padding: 16px !important;
            padding-bottom: 84px !important;
          }
        }
      `}</style>
    </AdminGuard>
  );
}
