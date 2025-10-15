import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Tokens } from '@/services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: Tokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, tokens) =>
        set({
          user,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
