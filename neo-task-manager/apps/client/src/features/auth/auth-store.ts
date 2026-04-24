import type { AuthUser } from "@neo/types";
import { create } from "zustand";

interface AuthState {
  user: AuthUser | null;
  isReady: boolean;
  setUser: (user: AuthUser | null) => void;
  setReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isReady: false,
  setUser: (user) => set({ user }),
  setReady: (isReady) => set({ isReady })
}));

