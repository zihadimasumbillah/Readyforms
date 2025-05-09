import apiClient from './api-client';

/**
 * Utility functions for API debugging and connectivity testing
 * Particularly useful for diagnosing CORS issues
 */
export const apiDebug = {
  /**
   * Test connection to the API server
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    error?: any;
    baseUrl: string;
    timestamp: Date;
    cors?: {
      status: 'ok' | 'error';
      message?: string;
    };
  }> {
    try {
      const baseUrl = apiClient.defaults.baseURL || 'No base URL configured';
      console.log('Testing connection to API server:', baseUrl);
      
      const startTime = Date.now();
      const response = await apiClient.get('/health/ping');
      const endTime = Date.now();
      
      return {
        success: true,
        message: `Connection successful (${endTime - startTime}ms)`,
        baseUrl,
        timestamp: new Date(),
        cors: { status: 'ok' }
      };
    } catch (error: any) {
      // Check if CORS error
      const isCorsError = !error.response && error.message === 'Network Error';
      
      return {
        success: false,
        message: error.message || 'Connection failed',
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        },
        baseUrl: apiClient.defaults.baseURL || 'No base URL configured',
        timestamp: new Date(),
        cors: isCorsError ? {
          status: 'error',
          message: 'This appears to be a CORS error. The server may not be properly configured to allow cross-origin requests.'
        } : undefined
      };
    }
  },
  
  /**
   * Test CORS configuration specifically
   */
  async testCorsConfig() {
    try {
      const response = await apiClient.get('/health/cors');
      return {
        success: true,
        message: 'CORS configuration is working correctly',
        data: response.data,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'CORS configuration test failed',
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        },
        timestamp: new Date()
      };
    }
  },
  
  /**
   * Get client configuration information
   */
  getClientInfo() {
    return {
      apiUrl: apiClient.defaults.baseURL,
      environment: process.env.NODE_ENV,
      appName: process.env.NEXT_PUBLIC_APP_NAME,
      clientHost: typeof window !== 'undefined' ? window.location.host : 'SSR',
      cors: {
        credentials: apiClient.defaults.withCredentials,
      }
    };
  }
};

export default apiDebug;
