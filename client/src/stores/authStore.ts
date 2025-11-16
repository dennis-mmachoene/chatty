// ============================================
// FILE: src/stores/authStore.ts
// Authentication state management with Zustand
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user.types';
import { STORAGE_KEYS } from '@/utils/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: STORAGE_KEYS.USER,
    }
  )
);







