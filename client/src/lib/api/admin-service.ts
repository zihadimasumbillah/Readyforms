import apiClient from './api-client';
import { User, Template } from '@/types';

// Types for admin dashboard data
interface DashboardStats {
  users: number;
  templates: number;
  responses: number;
  likes: number;
  comments: number;
  activeUsers: number;
  topicsCount: number;
  adminCount: number;
}

export const adminService = {
  // Get dashboard statistics for admin
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<DashboardStats>('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Return default values if API fails
      return {
        users: 0,
        templates: 0,
        responses: 0,
        likes: 0,
        comments: 0,
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
      console.error('Error fetching all users:', error);
      return [];
    }
  },

  // Toggle user block status (admin only)
  toggleUserBlock: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{ user: User }>(`/users/${userId}/block`);
      return response.data.user;
    } catch (error) {
      console.error('Error toggling user block status:', error);
      throw error;
    }
  },

  // Toggle user admin status (admin only)
  toggleUserAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{ user: User }>(`/users/${userId}/admin`);
      return response.data.user;
    } catch (error) {
      console.error('Error toggling user admin status:', error);
      throw error;
    }
  },

  // Get all templates (admin only)
  getAllTemplates: async (): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>('/admin/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching all templates:', error);
      return [];
    }
  },

  // Get system activity (admin only)
  getSystemActivity: async () => {
    try {
      const response = await apiClient.get('/admin/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching system activity:', error);
      return [];
    }
  },

  // Get system health (admin only)
  getSystemHealth: async () => {
    try {
      const response = await apiClient.get('/admin/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      return null;
    }
  }
};

export default adminService;