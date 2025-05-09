import apiClient from './api-client';

/**
 * Debug service for checking API connectivity and authentication status
 */
export const debugApi = {
  /**
   * Test API connectivity with basic health check endpoint
   */
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('API connection test failed:', error);
      throw new Error('Cannot connect to API server');
    }
  },
  
  /**
   * Test authentication status with the current token
   */
  async testAuthentication(): Promise<{ authenticated: boolean; user?: any; error?: string }> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { 
          authenticated: false, 
          error: 'No authentication token found' 
        };
      }
      
      const response = await apiClient.get('/auth/me');
      
      return {
        authenticated: true,
        user: response.data
      };
    } catch (error: any) {
      return { 
        authenticated: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },
  
  /**
   * Get token expiration info
   */
  getTokenInfo(): { 
    exists: boolean; 
    expiresAt?: Date; 
    isExpired?: boolean;
    payload?: any;
  } {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { exists: false };
    }
    
    try {
      // Get payload from token (middle part between dots)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      if (payload.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        const isExpired = expiresAt < new Date();
        
        return {
          exists: true,
          expiresAt,
          isExpired,
          payload
        };
      }
      
      return { exists: true, payload };
    } catch (error) {
      console.error('Error parsing token:', error);
      return { 
        exists: true,
        isExpired: true
      };
    }
  },
  
  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
