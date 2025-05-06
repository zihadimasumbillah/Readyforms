"use client";

import { createContext, useContext, useEffect, useState } from "react";
import authService, { User } from "@/lib/api/auth-service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize user from localStorage to prevent brief unauthenticated states during page loads
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch current user
        const currentUser = await authService.getCurrentUser();
        // Store the refreshed user details
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check error:", error);
        // Don't clear tokens on network errors to prevent unnecessary logouts
        if ((error as any)?.status === 401) {
          // Only clear on actual auth errors, not network issues
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Call login API
      const response = await authService.login({
        email,
        password,
      });

      // Store token and user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
    } catch (error) {
      // Log and rethrow
      console.error("Login error in context:", error);
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      // Validate inputs
      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
      }
      
      // Call register API
      const response = await authService.register({
        name,
        email,
        password,
      });

      // Store token and user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
    } catch (error) {
      // Log and rethrow
      console.error("Register error in context:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear state
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};