import { create } from "zustand";

import { tokenStorage } from "@/lib/token-storage";

interface User {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!tokenStorage.getAccessToken(),
  user: null,

  setAuth: (user, accessToken, refreshToken) => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
    set({ isAuthenticated: true, user });
  },

  logout: () => {
    tokenStorage.clear();
    set({ isAuthenticated: false, user: null });
  },
}));
