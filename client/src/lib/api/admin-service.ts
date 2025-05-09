import apiClient from './api-client';
import { User, Template, FormResponse } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

interface DashboardStats {
  users: number;
  templates: number;
  responses: number;
  likes: number;
  comments: number;
  activeUsers: number;
  topicsCount: number;
  adminCount: number;
  userRegistrations?: any[];
  formSubmissions?: any[];
}

interface SystemActivity {
  type: string;
  action: string;
  timestamp: string;
  user: { id: string; name: string } | null;
  data: any;
}

export const adminService = {
  /**
   * Get all users with pagination
   */
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle user block status
   */
  async toggleUserBlock(userId: string): Promise<User> {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/block`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to toggle block for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle user admin status
   */
  async toggleUserAdmin(userId: string): Promise<User> {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/admin`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to toggle admin for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/admin/dashboard-stats');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get system activity
   */
  async getSystemActivity(count = 10): Promise<SystemActivity[]> {
    try {
      const response = await apiClient.get(`/admin/system-activity/${count}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch system activity:', error);
      throw error;
    }
  },

  /**
   * Get all templates
   */
  async getAllTemplates(page = 1, limit = 10): Promise<PaginatedResponse<Template>> {
    try {
      const response = await apiClient.get(`/admin/templates?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  },

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<Template> {
    try {
      const response = await apiClient.get(`/admin/templates/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Get all form responses
   */
  async getAllResponses(page = 1, limit = 10): Promise<PaginatedResponse<FormResponse>> {
    try {
      const response = await apiClient.get(`/admin/responses?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch responses:', error);
      throw error;
    }
  },

  /**
   * Get users count
   */
  async getUsersCount(): Promise<number> {
    try {
      const response = await apiClient.get('/admin/users-count');
      return response.data.count;
    } catch (error: any) {
      console.error('Failed to fetch users count:', error);
      throw error;
    }
  }
};

export default adminService;