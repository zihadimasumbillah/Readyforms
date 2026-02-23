const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }
  return '/api';
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
