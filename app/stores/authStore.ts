import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthTokens, LoginCredentials } from '@/lib/types';
import { authService } from '@/lib/api/services';

// Helper functions for token management
const setTokens = (tokens: AuthTokens | null) => {
  if (typeof window === 'undefined') return;

  if (tokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    // Sync avec userToken pour compatibilité avec les autres services
    localStorage.setItem('userToken', tokens.accessToken);
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userToken');
  }
};

const getTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }

  return null;
};

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const result = await authService.staffLogin(credentials);

          if (!result) {
            throw new Error('Login failed: No response from server');
          }

          const { user, tokens } = result;

          // Set tokens in axios client
          setTokens(tokens);

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Login failed. Please try again.';

          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear tokens
          setTokens(null);

          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        try {
          const tokens = getTokens();

          if (!tokens) {
            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          set({ isLoading: true });

          // Verify token by fetching current user
          const user = await authService.getCurrentUser();

          if (!user) {
            throw new Error('Failed to fetch user');
          }

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Auth check error:', error);

          // Clear invalid tokens
          setTokens(null);

          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
