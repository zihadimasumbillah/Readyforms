import axios, { AxiosError, AxiosInstance } from 'axios';

// Base URL configuration from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with base configuration
const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 seconds timeout
});

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Add token to headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Special handling for requests with file uploads
    if (config.data && config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (config.data && typeof config.data !== 'string') {
      try {
        // Test if data can be stringified (avoid errors with File objects)
        JSON.stringify(config.data);
      } catch (error) {
        console.error('Invalid JSON data in request:', error);
        throw new Error('Invalid JSON data in request');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
instance.interceptors.response.use(
  (response) => {
    // If the response has data property, return it directly
    return response.data;
  },
  (error: AxiosError) => {
    // Handle errors based on status codes
    if (error.response) {
      const status = error.response.status;
      
      // Handle authentication errors
      if (status === 401) {
        // Only clear token on server auth errors, not client validation errors
        if (error.response.config.url !== '/auth/login' && 
            error.response.config.url !== '/auth/register' && 
            error.response.config.method !== 'post') {
          
          // Check if we're already on the login page or if we have a pending auth request
          const isAuthRelatedPath = window.location.pathname.includes('/auth/');
          const isCheckingAuth = error.response.config.url === '/auth/me' || 
                                error.response.config.url === '/auth/current-user';
          
          // Only clear token and redirect if not already on auth page and not checking auth
          if (typeof window !== 'undefined' && !isAuthRelatedPath && !isCheckingAuth) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Store the current location for redirecting back after login
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            
            // Use router for navigation instead of direct location change
            // This is smoother and maintains React state
            window.location.href = '/auth/login';
          }
        }
      }
      
      // Format error message with more context
      let errorMessage: string;
      
      if (error.response.data && typeof error.response.data === 'object') {
        if ('message' in error.response.data) {
          errorMessage = error.response.data.message as string;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else {
        errorMessage = error.message || 'Unknown error';
      }
      
      // Enhance error object with formatted message
      const enhancedError: any = new Error(errorMessage);
      enhancedError.status = status;
      enhancedError.data = error.response.data;
      enhancedError.originalError = error;
      
      return Promise.reject(enhancedError);
    }
    
    // Network errors, server not responding, etc.
    if (error.request) {
      const networkError = new Error('Network error. Please check your connection or try again later.');
      return Promise.reject(networkError);
    }
    
    // Something else caused the error
    return Promise.reject(error);
  }
);

// API client methods with types
const apiClient = {
  get: async <T>(url: string, config = {}) => {
    try {
      return await instance.get<any, T>(url, config);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },
  
  post: async <T>(url: string, data = {}, config = {}) => {
    try {
      return await instance.post<any, T>(url, data, config);
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },
  
  put: async <T>(url: string, data = {}, config = {}) => {
    try {
      return await instance.put<any, T>(url, data, config);
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },
  
  delete: async <T>(url: string, config = {}) => {
    try {
      return await instance.delete<any, T>(url, config);
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },
  
  patch: async <T>(url: string, data = {}, config = {}) => {
    try {
      return await instance.patch<any, T>(url, data, config);
    } catch (error) {
      console.error(`PATCH ${url} failed:`, error);
      throw error;
    }
  }
};

export default apiClient;