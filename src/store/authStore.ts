import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthSessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthSessionActions {
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
  setUser: (partial: Partial<User>) => void;
}

type AuthStore = AuthSessionState & AuthSessionActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isAdmin:         false,

      setSession: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'ROLE_ADMIN',
        }),

      clearSession: () =>
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false }),

      setUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    { name: 'manusia-auth-storage' },
  ),
);
