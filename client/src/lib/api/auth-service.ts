import apiClient from './api-client';
import { setAuthToken } from './api-client';
import { AxiosResponse } from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  blocked: boolean;
  language?: string;
  theme?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  // User login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store token and user in localStorage
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // User registration
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    // Store token and user in localStorage
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // User logout
  logout: (): void => {
    // Remove token and user from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('token') !== null;
  },
  
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // First check if we have user in localStorage
      if (typeof window !== 'undefined') {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          return JSON.parse(userJson);
        }
      }
      
      // If not, fetch from API
      const response = await apiClient.get<{user: User}>('/auth/me');
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get user from localStorage
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },
  
  // Update user preferences
  updatePreferences: async (preferences: { language?: string; theme?: string }): Promise<User> => {
    const response = await apiClient.put<{user: User}>('/auth/preferences', preferences);
    
    // Update user in localStorage
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const updatedUser = { ...user, ...preferences };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response.data.user;
  }
};