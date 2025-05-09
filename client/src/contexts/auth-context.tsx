"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/api/auth-service';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, language?: string, theme?: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (language?: string, theme?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for existing token and load user data on mount
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        
        if (authService.isLoggedIn()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Clear invalid token
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    language = 'en', 
    theme = 'light'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(name, email, password, language, theme);
      setUser(response.user);
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updatePreferences = async (language?: string, theme?: string) => {
    try {
      const updatedUser = await authService.updatePreferences(language, theme);
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          language: updatedUser.language,
          theme: updatedUser.theme
        };
      });
    } catch (error: any) {
      setError(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updatePreferences
      }}
    >
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

export default AuthContext;