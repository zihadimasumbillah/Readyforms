import apiClient from './api-client';
import { User, Template, FormResponse, Topic } from '@/types';

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
  async getUsers(page = 1, limit = 10): Promise<{ users: User[], pagination: any }> {
    try {
      const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  /**
   * Get all users without pagination
   * This is an alias for backward compatibility
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get(`/admin/users?limit=1000`);
      return response.data.users;
    } catch (error: any) {
      console.error('Failed to fetch all users:', error);
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
  async getAllTemplates(page = 1, limit = 10): Promise<Template[]> {
    try {
      const response = await apiClient.get(`/admin/templates?page=${page}&limit=${limit}`);
      // Return just the templates array instead of the whole response object
      return response.data.templates;
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  },
  
  /**
   * Get all topics
   */
  async getAllTopics(): Promise<Topic[]> {
    try {
      const response = await apiClient.get('/admin/topics');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch topics:', error);
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
  async getAllResponses(page = 1, limit = 10): Promise<FormResponse[]> {
    try {
      const response = await apiClient.get(`/admin/responses?page=${page}&limit=${limit}`);
      // Return just the responses array instead of the whole response object
      return response.data.responses;
    } catch (error: any) {
      console.error('Failed to fetch responses:', error);
      throw error;
    }
  },
  
  /**
   * Get form response by ID
   */
  async getFormResponseById(responseId: string): Promise<FormResponse> {
    try {
      const response = await apiClient.get(`/admin/responses/${responseId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch form response ${responseId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete form response
   */
  async deleteFormResponse(responseId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/responses/${responseId}`);
    } catch (error: any) {
      console.error(`Failed to delete form response ${responseId}:`, error);
      throw error;
    }
  },

  /**
   * Get form responses by template ID
   */
  async getFormResponsesByTemplate(templateId: string): Promise<FormResponse[]> {
    try {
      const response = await apiClient.get(`/admin/templates/${templateId}/responses`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch responses for template ${templateId}:`, error);
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