import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, AuthTokens, LoginCredentials } from '@/lib/types';
import { authService } from '@/lib/api/services';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Helper functions for token management
const setTokensToStorage = (tokens: AuthTokens | null) => {
  if (typeof window === 'undefined') return;

  if (tokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('userToken', tokens.accessToken); // For compatibility
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userToken');
  }
};

const getTokensFromStorage = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }

  return null;
};

const getUserFromStorage = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  return null;
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.staffLogin(credentials);

      if (!response || !response.data) {
        throw new Error('Login failed: No response from server');
      }

      const { user, tokens } = response.data;

      if (!user || !tokens) {
        throw new Error('Login failed: Invalid response structure');
      }

      // Set tokens in storage
      setTokensToStorage(tokens);

      // Store user
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      console.log('✅ Login successful, user:', user.email);

      return { user, tokens };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear tokens
    setTokensToStorage(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }
});

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = getTokensFromStorage();

      if (!tokens) {
        throw new Error('No tokens found');
      }

      // Verify token by fetching current user
      const response = await authService.getCurrentUser();

      if (!response || !response.data) {
        throw new Error('Failed to fetch user');
      }

      const user = response.data;

      console.log('✅ Auth check successful, user:', user.email);

      return { user, tokens };
    } catch (error) {
      console.error('❌ Auth check error:', error);

      // Clear invalid tokens
      setTokensToStorage(null);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      return rejectWithValue('Authentication failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    user: getUserFromStorage(),
    tokens: getTokensFromStorage(),
    isAuthenticated: !!getTokensFromStorage(),
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
