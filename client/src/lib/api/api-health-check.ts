import apiClient from './api-client';

/**
 * Check the health of the API
 * @returns Promise with health check result
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health/ping');
    return {
      status: 'ok',
      message: 'API server is responding',
      data: response.data,
      timestamp: new Date()
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: 'API server is not responding',
      error: error.message,
      timestamp: new Date()
    };
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
  async checkHealth() {
    return checkApiHealth();
  },

  /**
   * Check database health status
   * @returns Promise with health check result
   */
  async checkDatabase() {
    try {
      const response = await apiClient.get('/health/database');
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
  async checkAuth() {
    try {
      const response = await apiClient.get('/auth/check');
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