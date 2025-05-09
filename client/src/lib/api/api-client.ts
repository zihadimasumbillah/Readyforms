import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Determine the correct API base URL based on the environment
 */
const getBaseUrl = () => {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('Using API URL from environment:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For client-side rendering, check the hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('Detected localhost, using development API URL');
      return 'http://localhost:3001/api';
    }
    
    // Production deployment
    console.log('Using production API URL');
    return 'https://readyforms-api.vercel.app/api';
  }
  
  // Server-side rendering fallback
  return 'https://readyforms-api.vercel.app/api';
};

// Create API client with determined base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

console.log('API client initialized with base URL:', apiClient.defaults.baseURL);

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only in browser context
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, 
        config.params ? `Params: ${JSON.stringify(config.params)}` : '');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, 
        response.status);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Detailed error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      baseURL: error.config?.baseURL
    });
    
    if (!error.response) {
      console.error('Network or CORS error detected. Check server CORS configuration and network connectivity.');
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;