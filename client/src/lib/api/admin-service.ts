import apiClient from './api-client';
import { User } from '@/types';

interface AdminDashboardStats {
  users: number;
  templates: number;
  responses: number;
  likes: number;
  comments: number;
  activeUsers: number;
  topicsCount: number;
  adminCount: number;
}

interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  title?: string;
  timestamp: string;
}

interface UserResponse {
  message: string;
  user: User;
}

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return {
        users: response.data.userCount || 0,
        templates: response.data.templateCount || 0,
        responses: response.data.responseCount || 0,
        likes: 0, // These might need to be added to the backend
        comments: 0,
        activeUsers: response.data.activeUsers || 0,
        topicsCount: 4, 
        adminCount: 1, 
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  },

  async getSystemActivity(limit: number = 5): Promise<ActivityItem[]> {
    try {
      return [
        {
          id: '1',
          type: 'user',
          user: 'John Doe',
          action: 'registered',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'template',
          user: 'Jane Smith',
          action: 'created',
          title: 'Customer Feedback Form',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() 
        },
        {
          id: '3',
          type: 'response',
          user: 'Mike Johnson',
          action: 'submitted',
          title: 'Product Survey',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() 
        }
      ];
    } catch (error) {
      console.error('Error fetching system activity:', error);
      return [];
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  async toggleUserBlock(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/block`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user block status:', error);
      throw error;
    }
  },

  async toggleUserAdmin(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/admin`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user admin status:', error);
      throw error;
    }
  },

  async getAllTemplates() {
    try {
      const response = await apiClient.get('/admin/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching all templates:', error);
      throw error;
    }
  },
  
  /**
   * Get all topics from the system
   */
  async getAllTopics() {
    try {
      const response = await apiClient.get('/topics');
      return response.data;
    } catch (error) {
      console.error('Error fetching all topics:', error);
      throw error;
    }
  },
  
  /**
   * @param templateId The ID of the template to retrieve
   */
  async getTemplateById(templateId: string) {
    try {
      const response = await apiClient.get(`/admin/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },
  
  /**
   * @param templateId The ID of the template to get responses for
   */
  async getFormResponsesByTemplate(templateId: string) {
    try {
      const response = await apiClient.get(`/admin/form-responses/template/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form responses by template:', error);
      throw error;
    }
  },
  
  /**
   * @param responseId The ID of the form response
   */
  async getFormResponseById(responseId: string) {
    try {
      const response = await apiClient.get(`/admin/form-responses/${responseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form response:', error);
      throw error;
    }
  },

  /**
   * @param responseId The ID of the form response to delete
   */
  async deleteFormResponse(responseId: string) {
    try {
      const response = await apiClient.delete(`/admin/form-responses/${responseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting form response:', error);
      throw error;
    }
  },

  /**
   * Get all form responses
   */
  async getAllFormResponses() {
    try {
      const response = await apiClient.get('/admin/form-responses');
      return response.data;
    } catch (error) {
      console.error('Error fetching all form responses:', error);
      throw error;
    }
  }
};

export default adminService;