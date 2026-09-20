import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/auth";

interface AuthStore {
  token: string | null;
  user: User | null;
  password: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: User, password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      password: null,
      isLoggedIn: false,
      login: (token, user, password) =>
        set({ token, user, password, isLoggedIn: true }),
      logout: () =>
        set({ token: null, user: null, password: null, isLoggedIn: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        password: state.password,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);