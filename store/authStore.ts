import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: number;
  email: string;
  name: string;
  type: string;
  image?: string;
  accessToken?: string;
  token?: {
    accessToken?: string;
    refreshToken?: string;
  };
  extra?: {
    birthday?: string;
    userId?: number | string;
  };
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      logout: () => {
        set({ user: null, isLoggedIn: false });
        localStorage.removeItem('auth-storage');
      },
      refreshToken: async () => {
        const { user, logout } = get();
        const refreshToken = user?.token?.refreshToken;

        if (!refreshToken) {
          logout();
          return false;
        }

        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-id': 'zuzuflow',
            },
            body: JSON.stringify({ refreshToken }),
          });

          const data = await response.json();

          if (data.ok && data.item?.token?.accessToken) {
            const updatedUser = {
              ...user,
              token: {
                ...user?.token,
                accessToken: data.item.token.accessToken,
                refreshToken: data.item.token.refreshToken || refreshToken,
              },
              accessToken: data.item.token.accessToken,
            };
            set({ user: updatedUser, isLoggedIn: true });
            return true;
          } else {
            logout();
            return false;
          }
        } catch (err) {
          console.error('Token refresh error:', err);
          logout();
          return false;
        }
      },
      checkAuth: async () => {
        const { user, logout, refreshToken } = get();
        const accessToken = user?.accessToken || user?.token?.accessToken;

        if (accessToken) {
          if (isTokenExpired(accessToken)) {
            const refreshed = await refreshToken();
            if (!refreshed) {
              console.log('refresh failed, logging out');
            }
          } else {
            set({ isLoggedIn: true });
          }
        } else if (user?.token?.refreshToken) {
          await refreshToken();
        } else {
          set({ isLoggedIn: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
