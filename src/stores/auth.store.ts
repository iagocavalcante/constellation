import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthSession {
  did: string;
  handle: string;
  email: string;
  accessJwt: string;
  refreshJwt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  session: AuthSession | null;
  login: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      session: null,
      login: (session) => set({ isAuthenticated: true, session }),
      logout: () => set({ isAuthenticated: false, session: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
