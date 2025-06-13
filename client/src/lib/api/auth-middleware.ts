import { authService } from './auth-service';

/**
 * Initialize authentication by checking if a valid token exists
 * Used in middleware for protected routes
 * @returns Promise<boolean> - True if auth is initialized, false otherwise
 */
export const initAuth = async (): Promise<boolean> => {
  const token = authService.getToken();
  
  if (!token) {
    return false;
  }
  
  // Verify token is valid by fetching current user
  try {
    const user = await authService.getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Error validating auth token:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 * For use in client-side route guards
 * @returns boolean - True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return authService.isAuthenticated();
};

/**
 * Middleware to handle authentication requirements
 * Redirects to login if not authenticated
 */
export const requireAuth = async (context: any) => {
  const isAuth = await initAuth();
  
  if (!isAuth) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
};

/**
 * Check if current user is an admin
 * For use in admin route guards
 */
export const isAdmin = async (): Promise<boolean> => {
  if (!authService.isAuthenticated()) {
    return false;
  }
  
  try {
    const user = await authService.getCurrentUser();
    return user?.isAdmin === true;
  } catch (error) {
    return false;
  }
};

/**
 * Middleware to require admin role
 * Redirects to dashboard if not admin
 */
export const requireAdmin = async (context: any) => {
  const isAuth = await initAuth();
  
  if (!isAuth) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  
  const admin = await isAdmin();
  
  if (!admin) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
};
