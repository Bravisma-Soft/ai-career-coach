import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes (300 seconds) - increased for complex AI operations like resume tailoring
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies and credentials
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // Handle network errors
    if (!error.response) {
      toast({
        title: 'Network Error',
        description: 'Unable to connect to server. Please check your internet connection.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response.data?.message || 'An error occurred';
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });

    return Promise.reject(error);
  }
);

/**
 * Retry a failed request with exponential backoff
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
}

/**
 * Create a cancellable request
 */
export function createCancellableRequest() {
  const controller = new AbortController();
  
  const cancel = () => controller.abort();
  
  const request = <T>(config: AxiosRequestConfig): Promise<T> => {
    return apiClient.request<T>({
      ...config,
      signal: controller.signal,
    }).then(response => response.data);
  };

  return { request, cancel };
}
