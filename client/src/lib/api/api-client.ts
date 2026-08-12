import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import ApiConfig from './api-config';

let tokenGetter: (() => string | null) | null = null;

export function setTokenGetter(getter: (() => string | null) | null) {
  tokenGetter = getter;
}

class ApiClient {
  private client: AxiosInstance;
  private isInitialized: boolean = false;
  
  constructor() {
    const timeout = typeof window === 'undefined' && process.env.NODE_ENV === 'production' 
      ? 5000
      : ApiConfig.TIMEOUT;
    
    this.client = axios.create({
      baseURL: ApiConfig.BASE_URL,
      timeout: timeout,
      withCredentials: ApiConfig.CREDENTIALS,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
    this.isInitialized = true;
  }
  
  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenGetter ? tokenGetter() : (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
        
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (!error.response) {
          console.error('Network Error - API server might be down', error.message);
          return Promise.reject({
            status: 'network_error',
            message: 'Unable to connect to the server. Please check your internet connection or try again later.',
            original: error
          });
        }
        
        if (error.response.status === 401) {
          if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
            console.warn('Authentication required. Redirecting to login...');
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
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
  
  public updateBaseUrl(newBaseUrl: string): void {
    this.client.defaults.baseURL = newBaseUrl;
  }
}

const apiClient = new ApiClient();
export default apiClient;
