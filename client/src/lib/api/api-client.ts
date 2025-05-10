import axios from 'axios';
import { getApiConfig, getBaseUrl } from './api-config';

const apiConfig = getApiConfig();

// Create axios instance with configuration
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: apiConfig.defaultTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Important for CORS - use only when needed with credentials
  withCredentials: apiConfig.useCredentials,
});

// Add a request interceptor to include auth token on each request if available
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other state management
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Do something with request error
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx triggers this function
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx trigger this function
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Response Error:', error.response.status, error.response.data);
      
      // Handle unauthorized errors (401)
      if (error.response.status === 401) {
        // Handle authentication error - maybe redirect to login
        if (typeof window !== 'undefined') {
          console.warn('Authentication required. Redirecting to login...');
          // Optional: Redirect to login page
          // window.location.href = '/auth/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error (No Response):', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;