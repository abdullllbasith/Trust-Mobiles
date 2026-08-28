import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  hasPermission,
  type AdminPermissionId,
} from "@/lib/permissions";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  can: (permission: AdminPermissionId) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === "admin",
      can: (permission) => {
        const user = get().user;
        if (!user || user.role !== "admin") return false;
        return hasPermission(user.permissions, permission);
      },
    }),
    {
      name: "trust-mobile-admin-auth",
    },
  ),
);
