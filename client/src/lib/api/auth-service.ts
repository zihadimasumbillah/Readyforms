import apiClient from './api-client';
import { AxiosError } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  language?: string;
  theme?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    language?: string;
    theme?: string;
  };
}

interface ApiErrorResponse {
  message: string;
  status?: number;
  error?: string;
  isNetworkError?: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      
      return response.data;
    } catch (error) {
      // Custom error handling
      const axiosError = error as AxiosError;
      let errorMessage = 'Login failed. Please try again.';
      let isNetworkError = false;
      
      if (!axiosError.response) {
        // Network error (no response)
        errorMessage = 'Unable to connect to the authentication server. Please check your internet connection.';
        console.error('Login network error:', axiosError.message);
        isNetworkError = true;
      } else if (axiosError.response.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (axiosError.response.status === 403) {
        errorMessage = 'Your account is blocked. Please contact administrator.';
      } else if (axiosError.response.data && (axiosError.response.data as any).message) {
        errorMessage = (axiosError.response.data as any).message;
      }
      
      console.error('Login error:', errorMessage);
      
      // Throw a standardized error object
      throw {
        message: errorMessage,
        status: axiosError.response?.status,
        error: axiosError.message,
        isNetworkError
      } as ApiErrorResponse;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      
      return response.data;
    } catch (error) {
      // Custom error handling
      const axiosError = error as AxiosError;
      let errorMessage = 'Registration failed. Please try again.';
      let isNetworkError = false;
      
      if (!axiosError.response) {
        // Network error
        errorMessage = 'Unable to connect to the registration server. Please check your internet connection.';
        console.error('Register network error:', axiosError.message);
        isNetworkError = true;
      } else if (axiosError.response.status === 400) {
        errorMessage = (axiosError.response.data as any).message || 'Invalid registration data';
      } else if (axiosError.response.data && (axiosError.response.data as any).message) {
        errorMessage = (axiosError.response.data as any).message;
      }
      
      console.error('Registration error:', errorMessage);
      
      throw {
        message: errorMessage,
        status: axiosError.response?.status,
        error: axiosError.message,
        isNetworkError
      } as ApiErrorResponse;
    }
  },

  async logout(): Promise<void> {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async updatePreferences(preferences: { language?: string; theme?: string }) {
    try {
      const response = await apiClient.put('/auth/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
  
  // Add the getToken method
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
};