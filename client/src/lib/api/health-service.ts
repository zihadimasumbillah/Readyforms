import axios from 'axios';
import apiClient from './api-client';

// Base URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
  endpoints?: {
    name: string;
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
  }[];
  databaseStatus?: 'connected' | 'disconnected';
}

/**
 * Check if API is available
 * @returns A promise that resolves to the health status
 */
export const checkApiHealth = async (): Promise<HealthCheckResponse> => {
  const startTime = Date.now();
  
  try {
    // Make a request to the health endpoint
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      message: 'API is online and responding',
      timestamp: new Date().toISOString(),
      endpoints: [
        {
          name: 'health',
          status: 'healthy',
          responseTime
        }
      ]
    };
  } catch (error) {
    console.error('API health check failed:', error);
    return {
      status: 'unhealthy',
      message: 'API is not responding',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Checks the status of essential API endpoints
 * @returns A promise that resolves to detailed endpoint status
 */
export const checkEndpoints = async (): Promise<HealthCheckResponse> => {
  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/topics', name: 'Topics' },
    { path: '/templates', name: 'Templates' }
  ];

  const results: HealthCheckResponse['endpoints'] = [];
  let allHealthy = true;

  for (const endpoint of endpoints) {
    const startTime = Date.now();
    try {
      await axios.get(`${API_URL}${endpoint.path}`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      results.push({
        name: endpoint.name,
        status: 'healthy',
        responseTime
      });
    } catch (error) {
      allHealthy = false;
      results.push({
        name: endpoint.name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime
      });
    }
  }

  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    message: allHealthy ? 'All endpoints are responding' : 'One or more endpoints are not responding',
    timestamp: new Date().toISOString(),
    endpoints: results
  };
};

/**
 * Performs a complete health check of the API
 * @returns A promise that resolves to complete health status
 */
export const getSystemStatus = async (): Promise<HealthCheckResponse> => {
  try {
    // This endpoint would return more comprehensive system status
    const response = await apiClient.get('/health/status');
    return {
      ...response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get system status:', error);
    
    // Fallback to basic health check
    return checkApiHealth();
  }
};

export default {
  checkApiHealth,
  checkEndpoints,
  getSystemStatus
};