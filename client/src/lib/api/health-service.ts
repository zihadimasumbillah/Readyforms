import axios from 'axios';
import apiClient from './api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface EndpointStatus {
  status: 'healthy' | 'unhealthy';
  name: string;
  message?: string;
  responseTime?: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  endpoints: EndpointStatus[];
}

const healthService = {
  /**
   * Check if the API is healthy
   */
  checkHealth: async (): Promise<boolean> => {
    try {
      await axios.get(`${API_URL}/health`, { timeout: 3000 });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  /**
   * Get detailed health status of all endpoints
   */
  checkEndpoints: async (): Promise<HealthCheckResponse> => {
    try {
      // Use the admin health check endpoint
      const response = await apiClient.get<HealthCheckResponse>('/health/check');
      return response.data;
    } catch (error) {
      console.error('Error checking endpoints:', error);
      // Return a fallback response
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        endpoints: [
          {
            name: 'API',
            status: 'unhealthy',
            message: 'Failed to connect to health check service'
          }
        ]
      };
    }
  },

  /**
   * Get system health metrics
   */
  getSystemHealth: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>('/health/system');
      return response.data;
    } catch (error) {
      console.error('Error getting system health:', error);
      return null;
    }
  },

  /**
   * Get the health status of the API and all its endpoints
   * @returns Health check response
   */
  async getHealthStatus(): Promise<HealthCheckResponse> {
    try {
      // Use the admin health check endpoint
      const response = await apiClient.get<HealthCheckResponse>('/health/check');
      return response.data;
    } catch (error) {
      console.error('Error checking endpoints:', error);
      // Return a fallback response
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        endpoints: [{
          name: 'API',
          status: 'unhealthy',
          message: 'Could not connect to API'
        }]
      };
    }
  }
};

// Export the checkApiHealth function specifically for compatibility
export const checkApiHealth = healthService.checkHealth;

// Export both as default and named export
export { healthService };
export default healthService;