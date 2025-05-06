"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '@/lib/api/auth-service';
import { checkApiHealth } from '@/lib/api/health-service';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login?: (email: string, password: string) => Promise<void>;
  register?: (name: string, email: string, password: string) => Promise<void>;
  logout?: () => void;
  isAuthenticated: boolean;
  apiHealthy: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  apiHealthy: true
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiHealthy, setApiHealthy] = useState(true);
  const router = useRouter();
  
  // Check API health during initialization
  useEffect(() => {
    const verifyApiHealth = async () => {
      try {
        const healthStatus = await checkApiHealth();
        const isHealthy = healthStatus.status === 'healthy';
        setApiHealthy(isHealthy);

        if (!isHealthy) {
          console.error("API Connection Issue: There might be a problem connecting to the server. Some features may not work.");
        }
      } catch (error) {
        console.error("Failed to check API health:", error);
        setApiHealthy(false);
      }
    };

    verifyApiHealth();
  }, []);

  // Check if user is already logged in on initial render
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRegister(name, email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Redirect to login page
    router.push('/auth/login');
  };

  const contextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    apiHealthy
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};