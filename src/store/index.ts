import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

interface AppState {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrency: (currency: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  currency: 'USD',
  setTheme: (theme) => set({ theme }),
  setCurrency: (currency) => set({ currency }),
}));

interface RefreshState {
  refreshTrigger: number;
  refreshData: () => void;
}

export const useRefreshStore = create<RefreshState>((set) => ({
  refreshTrigger: 0,
  refreshData: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
})); 