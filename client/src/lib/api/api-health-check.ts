import apiClient from './api-client';
import ApiConfig from './api-config';

const HEALTH_CHECK_TIMEOUT = 5000; // 5 second timeout for health checks

interface HealthCheckResult {
  status: 'ok' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
  endpoint?: string;
  error?: string; // Add the error property to the interface
}

/**
 * Check the health of the API
 * @returns Promise with health check result
 */
export const checkApiHealth = async (): Promise<HealthCheckResult> => {
  try {
    // First try the health ping endpoint with a shorter timeout
    const response = await apiClient.get('/health/ping', {
      timeout: HEALTH_CHECK_TIMEOUT
    });
    
    return {
      status: 'ok',
      message: 'API server is responding',
      data: response.data,
      timestamp: new Date(),
      endpoint: `${ApiConfig.BASE_URL}/health/ping`
    };
  } catch (error: any) {
    // If the primary health endpoint fails, try a fallback endpoint
    try {
      // Try API root as a fallback
      const response = await apiClient.get('/', {
        timeout: HEALTH_CHECK_TIMEOUT
      });
      
      return {
        status: 'ok',
        message: 'API server is responding (fallback endpoint)',
        data: response.data,
        timestamp: new Date(),
        endpoint: ApiConfig.BASE_URL
      };
    } catch (fallbackError: any) {
      // Both attempts failed
      return {
        status: 'error',
        message: 'API server is not responding',
        error: error.message,
        timestamp: new Date(),
        endpoint: `${ApiConfig.BASE_URL}/health/ping`
      };
    }
  }
};

/**
 * API health check utilities for monitoring API connection status
 */
export const apiHealthCheck = {
  /**
   * Check if the API server is responding
   * @returns Promise with health check result
   */
  async checkHealth(): Promise<HealthCheckResult> {
    return checkApiHealth();
  },

  /**
   * Check database health status
   * @returns Promise with health check result
   */
  async checkDatabase(): Promise<HealthCheckResult> {
    try {
      const response = await apiClient.get('/health/database', {
        timeout: HEALTH_CHECK_TIMEOUT
      });
      
      return {
        status: 'ok',
        message: 'Database is connected',
        data: response.data,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Database health check failed',
        error: error.message,
        timestamp: new Date()
      };
    }
  },

  /**
   * Check if auth system is working
   * @returns Promise with health check result
   */
  async checkAuth(): Promise<HealthCheckResult> {
    try {
      const response = await apiClient.get('/auth/check', {
        timeout: HEALTH_CHECK_TIMEOUT
      });
      
      return {
        status: 'ok',
        message: 'Auth system is working',
        data: response.data,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Auth system check failed',
        error: error.message,
        timestamp: new Date()
      };
    }
  },

  /**
   * Run a comprehensive health check of all API systems
   * @returns Promise with comprehensive health check results
   */
  async checkAll() {
    const results = {
      api: await this.checkHealth(),
      database: await this.checkDatabase(),
      auth: await this.checkAuth(),
      timestamp: new Date()
    };

    const overallStatus = Object.values(results).some(
      (result: any) => result.status === 'error'
    ) ? 'error' : 'ok';

    return {
      status: overallStatus,
      results,
      timestamp: new Date()
    };
  }
};

export default apiHealthCheck;