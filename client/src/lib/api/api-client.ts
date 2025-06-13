import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import ApiConfig from './api-config';

class ApiClient {
  private client: AxiosInstance;
  private isInitialized: boolean = false;
  
  constructor() {
    this.client = axios.create({
      baseURL: ApiConfig.BASE_URL,
      timeout: ApiConfig.TIMEOUT,
      withCredentials: ApiConfig.CREDENTIALS,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
    this.isInitialized = true;
    
    if (ApiConfig.DEBUG) {
      console.log('API Client initialized with base URL:', ApiConfig.BASE_URL);
      console.log('Credentials enabled:', ApiConfig.CREDENTIALS);
    }
  }
  
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        
        // If token exists, add to headers
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle network errors gracefully
        if (!error.response) {
          console.error('Network Error - API server might be down', error.message);
          return Promise.reject({
            status: 'network_error',
            message: 'Unable to connect to the server. Please check your internet connection or try again later.',
            original: error
          });
        }
        
        // Handle 401 specifically
        if (error.response.status === 401) {
          // If token exists but is invalid, clear it
          if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
            console.warn('Authentication required. Redirecting to login...');
            // Don't automatically clear token as that would log out the user
            // Instead, let the auth context handle this scenario
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Public methods to make API requests
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }
  
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }
  
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }
  
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
  
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
  
  // Utility method to update base URL (useful for testing or runtime switching)
  public updateBaseUrl(newBaseUrl: string): void {
    this.client.defaults.baseURL = newBaseUrl;
    if (ApiConfig.DEBUG) {
      console.log('API base URL updated:', newBaseUrl);
    }
  }
}

const apiClient = new ApiClient();
export default apiClient;