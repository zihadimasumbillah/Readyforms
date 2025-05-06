import axios from 'axios';

// Base URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create an instance of axios with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    // Get token from local storage
    let token;
    
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    // If token exists, add Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token on authentication error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;