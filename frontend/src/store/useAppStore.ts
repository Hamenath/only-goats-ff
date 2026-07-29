import { create } from "zustand";

interface TournamentSettings {
  tournamentDate: string;
  registrationLimit: number;
  registrationEnabled: boolean;
  prizePool: number;
  entryFee: number;
  reEntry: number;
}

interface AppState {
  registrationCount: number;
  settings: TournamentSettings;
  isNavbarVisible: boolean;
  isLoading: boolean;
  setRegistrationCount: (count: number) => void;
  setSettings: (settings: Partial<TournamentSettings>) => void;
  setNavbarVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  registrationCount: 0,
  settings: {
    tournamentDate: "2026-08-08T22:00:00+05:30",
    registrationLimit: 24,
    registrationEnabled: true,
    prizePool: 1000,
    entryFee: 100,
    reEntry: 40,
  },
  isNavbarVisible: true,
  isLoading: true,
  setRegistrationCount: (count) => set({ registrationCount: count }),
  setSettings: (settings) =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),
  setNavbarVisible: (visible) => set({ isNavbarVisible: visible }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
