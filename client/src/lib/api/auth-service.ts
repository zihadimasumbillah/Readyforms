import apiClient from './api-client';

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    language: string;
    theme: string;
  };
  error?: any;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(name: string, email: string, password: string, language = 'en', theme = 'system'): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        language,
        theme
      });
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        message: response.data.message || 'Registration successful',
        token: response.data.token,
        user: response.data.user
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.data?.message || 'Registration failed',
        error
      };
    }
  },
  
  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        message: response.data.message || 'Login successful',
        token: response.data.token,
        user: response.data.user
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.data?.message || 'Login failed',
        error
      };
    }
  },
  
  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    
    // Dispatch a logout event that can be listened to by components
    const logoutEvent = new CustomEvent('auth:logout', { 
      detail: { reason: 'user_logout' } 
    });
    window.dispatchEvent(logoutEvent);
  },
  
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get('/auth/me');
      
      return {
        success: true,
        message: 'User fetched successfully',
        user: response.data
      };
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        message: error.data?.message || 'Failed to get current user',
        error
      };
    }
  },
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
  
  /**
   * Update user preferences
   */
  async updatePreferences(preferences: { language?: string; theme?: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.put('/auth/preferences', preferences);
      
      return {
        success: true,
        message: response.data.message || 'Preferences updated successfully',
        user: response.data.user
      };
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      return {
        success: false,
        message: error.data?.message || 'Failed to update preferences',
        error
      };
    }
  },
  
  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      
      return {
        success: true,
        message: response.data.message || 'Password reset email sent'
      };
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        message: error.data?.message || 'Failed to request password reset',
        error
      };
    }
  },
  
  /**
   * Check if the user is logged in
   */
  isLoggedIn(): boolean {
    // Check if token exists and hasn't expired
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      // You can optionally add JWT token validation logic here
      // For basic check, just ensure the token exists
      return true;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  },
  
  /**
   * Get the stored token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
};

export default authService;