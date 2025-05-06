import apiClient from './api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  language?: string;
  theme?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Validate inputs before sending to backend
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }
      
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response;
    } catch (error) {
      // Better error logging
      if (error instanceof Error) {
        console.error('Login error:', error.message);
      } else {
        console.error('Login error:', error);
      }
      throw error;
    }
  },

  /**
   * Register user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      // Validate inputs before sending to backend
      if (!data || !data.name || !data.email || !data.password) {
        throw new Error('Name, email, and password are required');
      }
      
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences: { language?: string; theme?: string }): Promise<{ user: { language: string; theme: string } }> => {
    try {
      const response = await apiClient.put<{ user: { language: string; theme: string } }>('/auth/preferences', preferences);
      return response;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }
};

export default authService;