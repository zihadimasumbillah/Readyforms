"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/api/auth-service';

// Define the UserProfile interface locally
interface UserProfile {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  language?: string;
  theme?: string;
}

// Define the AuthResponse interface locally
interface AuthResponse {
  token: string;
  user: UserProfile;
}

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        if (authService.isLoggedIn()) {
          const currentUser = await authService.getCurrentUser();
          // Fix: Add null check before accessing the user property
          if (currentUser && currentUser.user) {
            setUser(currentUser.user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      // Fix: Add null check before accessing the user property
      if (response && response.user) {
        setUser(response.user);
      } else {
        throw new Error('Login response missing user data');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password);
      // Fix: Add null check before accessing the user property
      if (response && response.user) {
        setUser(response.user);
      } else {
        throw new Error('Registration response missing user data');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};