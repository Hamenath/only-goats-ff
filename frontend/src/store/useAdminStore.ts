import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (val: boolean) => void;
  mobileDrawerOpen: boolean;
  toggleMobileDrawer: () => void;
  setMobileDrawerOpen: (val: boolean) => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
      mobileDrawerOpen: false,
      toggleMobileDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
      setMobileDrawerOpen: (val) => set({ mobileDrawerOpen: val }),
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    { name: "admin-ui" }
  )
);


