import apiClient from './api-client';
import { User } from './auth-service';

export interface DashboardStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
  users: number;
  activeUsers: number;
  topicsCount: number;
  adminCount: number;
}

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<DashboardStats>('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if API fails
      return {
        templates: 0,
        responses: 0,
        likes: 0,
        comments: 0,
        users: 0,
        activeUsers: 0,
        topicsCount: 0,
        adminCount: 0
      };
    }
  },
  
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Toggle user block status
  toggleUserBlock: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{user: User}>(`/users/${userId}/block`);
      return response.data.user;
    } catch (error) {
      console.error(`Error toggling block status for user ${userId}:`, error);
      throw error;
    }
  },

  // Toggle user admin status
  toggleUserAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{user: User}>(`/users/${userId}/admin`);
      return response.data.user;
    } catch (error) {
      console.error(`Error toggling admin status for user ${userId}:`, error);
      throw error;
    }
  },

  // Get system health
  getSystemHealth: async () => {
    try {
      const response = await apiClient.get('/admin/health');
      return response.data;
    } catch (error) {
      console.error('Error getting system health:', error);
      return null;
    }
  },

  // Get activity logs
  getActivityLogs: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/admin/activity?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return { logs: [], total: 0 };
    }
  }
};