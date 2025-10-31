import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, AuthTokens } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (tokens: AuthTokens | null) => {
  if (tokens) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  } else {
    accessToken = null;
    refreshToken = null;

    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
};

export const getTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;

  const access = localStorage.getItem('accessToken');
  const refresh = localStorage.getItem('refreshToken');

  if (access && refresh) {
    return {
      accessToken: access,
      refreshToken: refresh,
    };
  }

  return null;
};

// Initialize tokens from localStorage
if (typeof window !== 'undefined') {
  const tokens = getTokens();
  if (tokens) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  }
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add access token to headers if available
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newTokens: AuthTokens = response.data.data;
        setTokens(newTokens);

        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }

        processQueue(null);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        setTokens(null);

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T = any>(url: string, params?: any) =>
    apiClient.get<ApiResponse<T>>(url, { params }).then((res) => res.data),

  post: <T = any>(url: string, data?: any) =>
    apiClient.post<ApiResponse<T>>(url, data).then((res) => res.data),

  put: <T = any>(url: string, data?: any) =>
    apiClient.put<ApiResponse<T>>(url, data).then((res) => res.data),

  patch: <T = any>(url: string, data?: any) =>
    apiClient.patch<ApiResponse<T>>(url, data).then((res) => res.data),

  delete: <T = any>(url: string) =>
    apiClient.delete<ApiResponse<T>>(url).then((res) => res.data),
};

export default apiClient;
