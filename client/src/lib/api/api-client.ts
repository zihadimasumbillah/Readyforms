import axios from 'axios';

// Determine base URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token in all requests
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage
    try {
      const authDataString = localStorage.getItem('readyforms_auth');
      if (authDataString) {
        const authData = JSON.parse(authDataString);
        if (authData && authData.token) {
          config.headers.Authorization = `Bearer ${authData.token}`;
        }
      }
    } catch (error) {
      console.error('Error accessing token from localStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400 && data?.message?.includes('Invalid credentials')) {
        // Log more details about login attempts
        console.error('Authentication failed:', data.message);
      }
      
      if (status === 401) {
        // Unauthorized - clear auth data and redirect to login if needed
        if (typeof window !== 'undefined') {
          localStorage.removeItem('readyforms_auth');
          
          // Only redirect if we're not already on the login page
          const path = window.location.pathname;
          if (!path.includes('/auth/login') && !path.includes('/auth/register')) {
            window.location.href = '/auth/login';
          }
        }
      }
      
      // Provide more detailed error information
      console.error(`API Error (${status}):`, data?.message || 'Unknown error');
    } else if (error.request) {
      // The request was made but no response
      console.error('API Network Error:', error.message);
    } else {
      // Something happened in setting up the request
      console.error('API Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;