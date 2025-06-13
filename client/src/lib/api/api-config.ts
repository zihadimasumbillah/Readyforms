/**
 * API Configuration
 */
const getApiUrl = (): string => {
  // Check for browser environment
  if (typeof window === 'undefined') {
    // Server-side rendering, use environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'https://readyforms-api.vercel.app/api';
  }

  // Client-side - first check if there's an API URL override in localStorage
  const overrideUrl = localStorage.getItem('api_debug_url');
  if (overrideUrl) {
    console.log('Using API URL override from localStorage:', overrideUrl);
    return overrideUrl;
  }

  // If no override, use environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Production fallback - use the deployed API URL
  if (window.location.hostname.includes('vercel.app') || window.location.hostname === 'readyforms.app') {
    return 'https://readyforms-api.vercel.app/api';
  }

  // Local development fallback
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api'
    : 'https://readyforms-api.vercel.app/api';
};

export const ApiConfig = {
  BASE_URL: getApiUrl(),
  CREDENTIALS: process.env.NEXT_PUBLIC_API_CREDENTIALS === 'true' || false,
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 2,
  RETRY_DELAY: 1000,
  DEBUG: process.env.NODE_ENV === 'development'
};

export default ApiConfig;
