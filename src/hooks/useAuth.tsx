
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string) => boolean;
  logout: () => void;
}

const ADMIN_EMAIL = 'condominiosolardasarvores@gmail.com';

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userEmail: null,
      login: (email: string) => {
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          set({ isAuthenticated: true, userEmail: email });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false, userEmail: null });
      },
    }),
    {
      name: 'condominio-auth',
    }
  )
);
