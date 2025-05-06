import axios from 'axios';
import apiClient from './api-client';

// Base URL configuration from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API connection test endpoints - FIXED: removed duplicate '/api' prefix
const API_ENDPOINTS = [
  '/health', // Health check endpoint
  '/topics', // Public endpoint to get topics
  '/templates', // Public endpoint to get templates
];

export interface HealthCheckResponse {
  success: boolean;
  endpoint: string;
  message?: string;
  error?: string;
  duration: number;
  timestamp: string;
}

/**
 * Tests connectivity to backend API endpoints
 * @returns Results of health check tests
 */
export async function checkApiConnectivity(): Promise<HealthCheckResponse[]> {
  const results: HealthCheckResponse[] = [];
  
  for (const endpoint of API_ENDPOINTS) {
    const startTime = Date.now();
    try {
      // Use direct axios call to ensure correct URL formation
      const response = await axios.get(`${API_URL}${endpoint}`);
      results.push({
        success: true,
        endpoint,
        message: `Successfully connected to ${endpoint}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      results.push({
        success: false,
        endpoint,
        error: error.message || 'Unknown error',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return results;
}

/**
 * Checks the health of the API server
 * @returns A promise that resolves to true if the API is healthy, false otherwise
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // Make a request to the health endpoint
    const response = await axios.get(`${API_URL}/health`);
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Retrieves server status details
 * @returns A promise that resolves to server status information or null on failure
 */
export const getServerStatus = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/health/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to get server status:', error);
    return null;
  }
};

/**
 * Check if API is reachable
 * @returns A promise that resolves to true if the API is reachable, false otherwise
 */
export const isApiReachable = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('API not reachable:', error);
    return false;
  }
};