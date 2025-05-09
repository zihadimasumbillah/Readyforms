import axios from 'axios';

// Determine the API base URL - Fix the URL placeholder issue
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }
  
  // Client-side: use environment variable or detect appropriate URL
  const urlFromEnv = process.env.NEXT_PUBLIC_API_URL;
  
  if (urlFromEnv) {
    console.log('Using API URL from environment:', urlFromEnv);
    return urlFromEnv;
  }
  
  // Auto-detect based on environment
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api'; // Local development
  } else if (window.location.hostname.includes('vercel.app')) {
    // If deployed on vercel, use the same hostname pattern but with -api suffix
    const hostParts = window.location.hostname.split('.');
    hostParts[0] = `${hostParts[0]}-api`;
    return `https://${hostParts.join('.')}/api`;
  } else {
    // Default to the production API URL
    return 'https://readyforms.vercel.app/api';
  }
};

const API_URL = getApiBaseUrl();
console.log('API client initialized with URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add authorization token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API requests in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration and other common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling with CORS detection
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        console.error(`API Error: ${error.response.status} ${error.response.statusText} - ${error.config.url}`);
      } else if (error.request) {
        console.error('API Error: No response received', error.request);
        // Check if it might be a CORS issue
        if (error.message === 'Network Error') {
          console.error('This might be a CORS issue. Check server CORS configuration.');
        }
      } else {
        console.error('API Error:', error.message);
      }
    }

    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Unauthorized, token might be expired
      localStorage.removeItem('token');
      // Only redirect if we're in a browser context
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;