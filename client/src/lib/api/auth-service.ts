import apiClient from './api-client';

// Types for request/response data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  language?: string;
  theme?: string;
}

export interface LoginData {
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
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      // Store auth data in localStorage
      this.setAuthData(response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Registration error:', error);
      // Enhance error handling to expose the specific error message from the API
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 
          'message' in error.response.data) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage as string);
      }
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Login attempt:', { email: data.email, passwordLength: data.password?.length });
      
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      console.log('Login successful, storing auth data');
      this.setAuthData(response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Login error details:', error);
      // Enhance error handling to expose the specific error message from the API
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 
          'message' in error.response.data) {
            const errorMessage = error.response.data.message;
            throw new Error(errorMessage as string);
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error: unknown) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: {
    language?: string;
    theme?: string;
  }): Promise<User> {
    try {
      const response = await apiClient.put<{ user: User }>(
        '/auth/preferences',
        preferences
      );
      
      // Update the stored user data to reflect preferences change
      const currentData = this.getAuthData();
      if (currentData) {
        this.setAuthData({
          ...currentData,
          user: response.data.user
        });
      }
      
      return response.data.user;
    } catch (error: unknown) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  // Get the stored auth data from localStorage
  getAuthData(): AuthResponse | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const authDataString = localStorage.getItem('readyforms_auth');
      if (!authDataString) return null;
      return JSON.parse(authDataString);
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      return null;
    }
  }

  // Store auth data in localStorage
  setAuthData(authData: AuthResponse): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('readyforms_auth', JSON.stringify(authData));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  // Clear auth data from localStorage
  clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('readyforms_auth');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthData();
  }

  // Logout
  logout(): void {
    this.clearAuthData();
  }
}

const authService = new AuthService();
export default authService;