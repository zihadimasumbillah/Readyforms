import apiClient from './api-client';

export const healthService = {
  async checkHealth() {
    try {
      // Make a request to the API health check endpoint
      // Using apiClient directly to ensure the base URL is handled correctly
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};