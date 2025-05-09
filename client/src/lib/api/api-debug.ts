import apiClient from './api-client';


export const apiDebug = {

  async testConnection(): Promise<{
    success: boolean;
    message: string;
    error?: any;
    baseUrl: string;
    timestamp: Date;
  }> {
    try {
      const baseUrl = apiClient.defaults.baseURL || 'No base URL configured';
      const startTime = Date.now();
      const response = await apiClient.get('/health');
      const endTime = Date.now();
      
      return {
        success: true,
        message: `Connection successful (${endTime - startTime}ms)`,
        baseUrl,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Connection failed',
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        },
        baseUrl: apiClient.defaults.baseURL || 'No base URL configured',
        timestamp: new Date()
      };
    }
  },

  async testAuth(): Promise<{
    authenticated: boolean;
    message: string;
    userData?: any;
    token: string | null;
    tokenInfo?: {
      isValid: boolean;
      exp?: Date;
      isExpired?: boolean;
      iat?: Date;
    };
    error?: any;
    timestamp: Date;
  }> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return {
        authenticated: false,
        message: 'No authentication token found',
        token: null,
        timestamp: new Date()
      };
    }
  
    try {
      const tokenInfo = this.decodeToken(token);
      
      try {
        const response = await apiClient.get('/auth/me');
        
        return {
          authenticated: true,
          message: 'Authentication successful',
          userData: response.data,
          token,
          tokenInfo,
          timestamp: new Date()
        };
      } catch (error: any) {
        return {
          authenticated: false,
          message: 'Authentication failed',
          token,
          tokenInfo,
          error: {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          },
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        authenticated: false,
        message: 'Token decode failed',
        token,
        error,
        timestamp: new Date()
      };
    }
  },
 
  decodeToken(token: string): {
    isValid: boolean;
    exp?: Date;
    isExpired?: boolean;
    iat?: Date;
    payload?: any;
    error?: any;
  } {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return { isValid: false };
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      const result: any = {
        isValid: true,
        payload
      };
      
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        result.exp = expDate;
        result.isExpired = expDate < new Date();
      }
      
      if (payload.iat) {
        result.iat = new Date(payload.iat * 1000);
      }
      
      return result;
    } catch (error) {
      return {
        isValid: false,
        error
      };
    }
  }
};
