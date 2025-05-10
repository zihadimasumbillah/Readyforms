/**
 * API Configuration
 * This file contains environment-based API settings
 */

type ApiConfig = {
  apiUrl: string;
  useCredentials: boolean;
  defaultTimeout: number;
  appName: string;
  environment: string;
};

/**
 * Get API configuration based on environment
 */
export function getApiConfig(): ApiConfig {
  // Using NEXT_PUBLIC environment variables
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const useCredentials = process.env.NEXT_PUBLIC_API_CREDENTIALS === 'true';
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'ReadyForms';
  
  return {
    apiUrl,
    useCredentials,
    defaultTimeout: 15000,
    appName,
    environment
  };
}

/**
 * Get the base URL for the API
 */
export function getBaseUrl(): string {
  // Check if we're in the browser or server-side
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isClient = typeof window !== 'undefined';
  
  if (isClient && isDevelopment) {
    // In development on client, use localhost API URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  } 
  
  if (isClient && !isDevelopment) {
    // In production on client, use production API URL
    return process.env.NEXT_PUBLIC_API_URL || 'https://readyforms-api.vercel.app/api';
  }

  // Server-side (SSR)
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
}

/**
 * Check if we're running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';
}

/**
 * Get API headers for all requests
 */
export function getDefaultHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export default getApiConfig;
