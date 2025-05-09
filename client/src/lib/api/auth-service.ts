import apiClient from './api-client';
import { User } from '@/types';

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Logging in with:', { email });
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      } else {
        console.error('Login response missing token:', response.data);
        throw new Error('Invalid response format - missing token');
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(
    name: string,
    email: string,
    password: string,
    language: string = 'en',
    theme: string = 'light'
  ): Promise<RegisterResponse> {
    try {
      console.log('Registering user:', { name, email });
      
      // Make sure we don't have Authorization header for registration
      delete apiClient.defaults.headers.common['Authorization'];
      
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        language,
        theme
      });

      console.log('Registration response:', response.data);

      if (response.data && response.data.token) {
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      } else {
        console.error('Registration response missing token:', response.data);
        throw new Error('Invalid response format - missing token');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Try to get the token from localStorage
      const token = this.getToken();
      
      // Set the auth header if we have a token
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('No authentication token found');
      }
      
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(language?: string, theme?: string): Promise<User> {
    try {
      const response = await apiClient.put('/auth/preferences', {
        language,
        theme
      });
      return response.data.user;
    } catch (error: any) {
      console.error('Update preferences error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout user by clearing token
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    delete apiClient.defaults.headers.common['Authorization'];
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
};