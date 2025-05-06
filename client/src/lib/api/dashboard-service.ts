import axios from 'axios';
import { DashboardStats, Template, FormResponse } from '@/types';
import { authService } from './auth-service';

// API base URL from environment variables or fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Add auth headers helper
const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Dashboard service for handling dashboard-related operations
export const dashboardService = {
  // Get user's templates
  async getUserTemplates(): Promise<Template[]> {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get<Template[]>(
        `${API_URL}/templates/user/${user.id}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user templates');
    }
  },

  // Get user's form responses
  async getUserResponses(): Promise<FormResponse[]> {
    try {
      const response = await axios.get<FormResponse[]>(
        `${API_URL}/form-responses/user`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user responses');
    }
  },

  // Get user dashboard statistics
  async getUserStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get<DashboardStats>(
        `${API_URL}/dashboard/stats`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      // Return default stats on error
      return {
        templates: 0,
        responses: 0,
        likes: 0,
        comments: 0
      };
    }
  },

  // Get popular templates
  async getPopularTemplates(limit: number = 5): Promise<Template[]> {
    try {
      const response = await axios.get<Template[]>(
        `${API_URL}/templates/popular?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular templates');
    }
  }
};