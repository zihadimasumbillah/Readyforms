import apiClient from './api-client';

/**
 * API health check functions for checking backend connectivity
 */
export const apiHealth = {
 
  async ping(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health/ping');
      return response.status === 200 && response.data.status === 'ok';
    } catch (error) {
      console.warn('API health check (ping) failed:', error);
      return false;
    }
  },
  
  /**
   * Check database connectivity
   */
  async checkDatabase(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health/database');
      return response.status === 200 && response.data.status === 'ok';
    } catch (error) {
      console.warn('API database health check failed:', error);
      return false;
    }
  },
  
  /**
   * Get detailed health status
   */
  async getFullStatus() {
    try {
      const response = await apiClient.get('/health/full');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API full health check failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
  
  /**
   * Run all health checks
   */
  async checkAll() {
    const results = {
      ping: await this.ping(),
      database: await this.checkDatabase(),
      fullStatus: await this.getFullStatus(),
      timestamp: new Date()
    };
    
    return {
      ...results,
      allHealthy: results.ping && results.database && results.fullStatus.success
    };
  }
};

export default apiHealth;
