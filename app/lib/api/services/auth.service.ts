import { api } from '../client';
import type {
  ApiResponse,
  AuthUser,
  AuthTokens,
  LoginCredentials,
  RegisterData
} from '@/lib/types';

export const authService = {
  // Staff authentication
  staffLogin: async (credentials: LoginCredentials) => {
    const response = await api.post<{ user: AuthUser; tokens: AuthTokens }>(
      '/auth/staff/login',
      credentials
    );
    return response.data;
  },

  staffRegister: async (data: RegisterData) => {
    const response = await api.post<{ user: AuthUser; tokens: AuthTokens }>(
      '/auth/staff/register',
      data
    );
    return response.data;
  },

  // Guest authentication
  guestLogin: async (credentials: LoginCredentials) => {
    const response = await api.post<{ user: AuthUser; tokens: AuthTokens }>(
      '/auth/guest/login',
      credentials
    );
    return response.data;
  },

  guestRegister: async (data: RegisterData) => {
    const response = await api.post<{ user: AuthUser; tokens: AuthTokens }>(
      '/auth/guest/register',
      data
    );
    return response.data;
  },

  requestOTP: async (email: string) => {
    const response = await api.post('/auth/guest/request-otp', { email });
    return response;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post<{ user: AuthUser; tokens: AuthTokens }>(
      '/auth/guest/verify-otp',
      { email, otp }
    );
    return response.data;
  },

  // Common
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<AuthUser>('/auth/me');
    return response.data;
  },
};
