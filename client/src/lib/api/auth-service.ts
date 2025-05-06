import apiClient from './api-client';
import { User } from '@/types';

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

/**
 * User login
 * @param email User email
 * @param password User password
 * @returns Promise with token and user details
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * User registration
 * @param name User name
 * @param email User email
 * @param password User password
 * @returns Promise with token and user details
 */
export const register = async (
  name: string, 
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get current user details
 * @returns Promise with user details
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  } catch (error: any) {
    console.error('Get user error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user preferences
 * @param preferences User preferences object
 * @returns Promise with updated user details
 */
export const updateUserPreferences = async (preferences: { 
  theme?: string;
  language?: string;
}): Promise<User> => {
  try {
    const response = await apiClient.put<{ user: User }>('/auth/preferences', preferences);
    return response.data.user;
  } catch (error: any) {
    console.error('Update preferences error:', error.response?.data || error.message);
    throw error;
  }
};

const authService = {
  login,
  register,
  getCurrentUser,
  updateUserPreferences
};

export default authService;