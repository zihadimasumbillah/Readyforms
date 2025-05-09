import apiClient from '../lib/api/api-client';
import { AxiosError } from 'axios';


export async function debugAuthStatus() {
  console.group('🔍 Auth Debug Information');
  
  try {
    const authDataString = localStorage.getItem('readyforms_auth');
    console.log('Auth data in localStorage:', authDataString ? 'Found' : 'Not found');
    
    if (authDataString) {
      try {
        const authData = JSON.parse(authDataString);
        console.log('Token exists:', !!authData.token);
        console.log('User info:', {
          name: authData.user?.name,
          email: authData.user?.email,
          isAdmin: authData.user?.isAdmin
        });
        
        if (authData.token) {
          const tokenParts = authData.token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Token payload:', payload);
            if (payload.exp) {
              const expTime = new Date(payload.exp * 1000);
              const now = new Date();
              const isExpired = now > expTime;
              console.log(`Token expires: ${expTime.toLocaleString()}`);
              console.log(`Token expired: ${isExpired ? 'Yes' : 'No'}`);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    
    try {
      const response = await apiClient.get('/auth/me');
      console.log('Current user API call successful:', response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching current user:', error.response?.data || error.message);
      } else {
        const err = error as Error;
        console.error('Error fetching current user:', err.message || String(error));
      }
    }

    try {
      const response = await apiClient.get('/health');
      console.log('API health:', response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('API health check failed:', error.response?.data || error.message);
      } else {
        const err = error as Error;
        console.error('API health check failed:', err.message || String(error));
      }
    }
    
  } catch (error) {
    console.error('Auth debug error:', error instanceof Error ? error.message : String(error));
  }
  
  console.groupEnd();
  return "Auth debug complete. See console output for details.";
}

if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthStatus;
  console.log('Auth debug function available: debugAuth()');
}

export default debugAuthStatus;
