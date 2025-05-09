import { authService } from './auth-service';
import apiClient from './api-client';

/**
 * Initialize authentication from stored token
 * Should be called when the app starts
 */
export const initAuth = async (): Promise<boolean> => {
  const token = authService.getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    // Set token in API client headers
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Verify token validity by fetching current user
    await authService.getCurrentUser();
    return true;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    // Clear invalid token
    authService.logout();
    return false;
  }
};

/**
 * Check if path requires authentication
 */
export const requiresAuth = (path: string): boolean => {
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/',
    '/templates',
  ];
  
  // Check if the path starts with any of the public paths
  return !publicPaths.some(publicPath => 
    path === publicPath || 
    (publicPath !== '/' && path.startsWith(publicPath + '/'))
  );
};
