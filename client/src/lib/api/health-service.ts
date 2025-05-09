import apiClient from './api-client';

export const healthService = {
  /**
   * Get health status
   */
  async getStatus(): Promise<any> {
    try {
      const response = await apiClient.get('/health/status');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch health status:', error);
      throw error;
    }
  },

  /**
   * Check CORS configuration
   */
  async checkCors(): Promise<any> {
    try {
      const response = await apiClient.get('/health/cors');
      return {
        success: true,
        corsStatus: response.data.corsStatus,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('CORS check failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  },

  /**
   * Ping the API server to check connectivity
   */
  async ping(): Promise<any> {
    try {
      const response = await apiClient.get('/ping');
      return {
        success: true,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error: any) {
      console.error('API ping failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  },

  /**
   * Comprehensive health check of the API and its services
   */
  async checkHealth(): Promise<{
    status: 'ok' | 'error';
    services: {
      api: {
        status: 'ok' | 'error';
        ping?: number;
        error?: string;
      };
      database: {
        status: 'ok' | 'error';
        error?: string;
      };
      cors: {
        status: 'ok' | 'error';
        error?: string;
      };
    };
    timestamp: Date;
  }> {
    try {
      const startTime = performance.now();
      
      // Try to get the health status
      const healthStatus = await this.getStatus().catch(err => ({
        status: 'error',
        database: { status: 'error', error: err.message },
        services: {}
      }));
      
      const endTime = performance.now();
      const pingTime = Math.round(endTime - startTime);
      
      // Try CORS check separately
      const corsCheck = await this.checkCors().catch(err => ({
        success: false,
        error: err.message
      }));
      
      return {
        status: healthStatus.status === 'up' && corsCheck.success ? 'ok' : 'error',
        services: {
          api: {
            status: pingTime < 5000 ? 'ok' : 'error',
            ping: pingTime
          },
          database: {
            status: healthStatus.database?.connected ? 'ok' : 'error',
            error: healthStatus.database?.error
          },
          cors: {
            status: corsCheck.success ? 'ok' : 'error',
            error: corsCheck.error
          }
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        services: {
          api: { status: 'error', error: error.message },
          database: { status: 'error' },
          cors: { status: 'error' }
        },
        timestamp: new Date()
      };
    }
  }
};

// Export a convenience function for checking health
export const checkApiHealth = healthService.checkHealth;

// Export the service as default
export default healthService;