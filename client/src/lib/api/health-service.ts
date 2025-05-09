import apiClient from './api-client';

/**
 * Response type for health check endpoints
 */
export interface HealthCheckResponse {
  success: boolean;
  corsStatus?: string;
  status?: string;
  message?: string;
  error?: string;
  timestamp: Date;
  ping?: number;
}

/**
 * Response type for endpoint status checks
 */
export interface EndpointStatusResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  endpoints: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    }
  };
  timestamp: Date;
  message: string;
}

export const healthService = {
  /**
   * Get health status
   */
  async getStatus(): Promise<HealthCheckResponse> {
    try {
      const response = await apiClient.get('/health/status');
      return {
        success: true,
        status: response.data.status,
        message: response.data.message,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('Failed to fetch health status:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  },

  /**
   * Check CORS configuration
   */
  async checkCors(): Promise<HealthCheckResponse> {
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
  async ping(): Promise<HealthCheckResponse> {
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
        success: false,
        error: err.message,
        timestamp: new Date()
      }));
      
      const endTime = performance.now();
      const pingTime = Math.round(endTime - startTime);
      
      // Try CORS check separately
      const corsCheck = await this.checkCors().catch(err => ({
        success: false,
        error: err.message,
        timestamp: new Date()
      }));
      
      return {
        status: healthStatus.success && corsCheck.success ? 'ok' : 'error',
        services: {
          api: {
            status: pingTime < 5000 ? 'ok' : 'error',
            ping: pingTime
          },
          database: {
            status: healthStatus.status === 'up' ? 'ok' : 'error',
            error: healthStatus.error
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
  },

  /**
   * Check all API endpoints status
   */
  async checkEndpoints(): Promise<EndpointStatusResponse> {
    try {
      const response = await apiClient.get('/health/endpoints');
      return {
        status: response.data.status || 'healthy',
        endpoints: response.data.endpoints || {},
        timestamp: new Date(),
        message: response.data.message || 'API endpoints check completed'
      };
    } catch (error: any) {
      console.error('Endpoints check failed:', error);
      return {
        status: 'unhealthy',
        endpoints: {
          'api': {
            status: 'down',
            error: error.message
          }
        },
        timestamp: new Date(),
        message: 'Failed to check API endpoints'
      };
    }
  }
};

// Export a convenience function for checking health
export const checkApiHealth = healthService.checkHealth;

// Export the service as default
export default healthService;