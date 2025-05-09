import axios from 'axios';

// Determine the API base URL based on environment
const getBaseUrl = () => {
  // For server-side rendering
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }
  
  // For client-side rendering
  const urlFromEnv = process.env.NEXT_PUBLIC_API_URL;
  return urlFromEnv || 'http://localhost:3001/api';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Set withCredentials to true to allow cookie-based authentication if needed
  withCredentials: true,
});

// Add a request interceptor to include auth token in all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration or auth errors
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear token on auth errors
        localStorage.removeItem('token');
        
        // Don't redirect if already on login page to avoid redirect loops
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login?message=session-expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;