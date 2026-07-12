import { create } from 'zustand';

interface AuthUIState {
  loading: boolean;
  error: string | null;
  success: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  reset: () => void;
}

export const useAuthUIStore = create<AuthUIState>((set) => ({
  loading: false,
  error: null,
  success: false,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  reset: () => set({ loading: false, error: null, success: false }),
}));
