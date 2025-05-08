import apiClient from './api-client';
import { FormResponse, Template, Topic, User } from '@/types';

export interface SystemActivity {
  id: string;
  type: 'template' | 'response' | 'user' | 'like';
  action: string;
  title?: string;
  user: string;
  timestamp: string;
}

const adminService = {
  toggleUserBlock: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{user: User}>(`/admin/users/${userId}/block`);
      return response.user;
    } catch (error) {
      console.error('Error toggling user block status:', error);
      throw error;
    }
  },
  toggleUserAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{user: User}>(`/admin/users/${userId}/admin`);
      return response.user;
    } catch (error) {
      console.error('Error toggling user admin status:', error);
      throw error;
    }
  },
  getAllTemplates: async (): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>('/admin/templates');
      return response;
    } catch (error) {
      console.error('Error fetching all templates:', error);
      try {
        const response = await apiClient.get<Template[]>('/templates');
        return response;
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
        return [];
      }
    }
  },
  
  getTemplateById: async (id: string): Promise<Template> => {
    try {
      const response = await apiClient.get<Template>(`/admin/templates/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching template ${id} as admin:`, error);
      return await apiClient.get<Template>(`/templates/${id}`);
    }
  },

  updateTemplate: async (id: string, templateData: any): Promise<Template> => {
    try {
      const response = await apiClient.put<Template>(`/admin/templates/${id}`, templateData);
      return response;
    } catch (error) {
      console.error(`Error updating template ${id} as admin:`, error);
      throw error;
    }
  },
  
  deleteTemplate: async (id: string, version: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/templates/${id}`, { data: { version } });
    } catch (error) {
      console.error(`Error deleting template ${id} as admin:`, error);
      throw error;
    }
  },
  
  // Get all form responses across the system (admin only)
  getAllFormResponses: async (limit: number = 100, page: number = 1): Promise<FormResponse[]> => {
    try {
      const response = await apiClient.get<FormResponse[]>(
        `/admin/responses?limit=${limit}&page=${page}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching all form responses:', error);
      return [];
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/admin/users');
      return response;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  },

  getAllTopics: async (): Promise<Topic[]> => {
    try {
      const response = await apiClient.get<Topic[]>('/admin/topics');
      return response;
    } catch (error) {
      console.error('Error fetching topics:', error);
      return [];
    }
  },

  createTopic: async (name: string, description?: string): Promise<Topic> => {
    try {
      const response = await apiClient.post<Topic>('/admin/topics', { name, description });
      return response;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  },

  updateTopic: async (id: string, name: string, description: string, version: number): Promise<Topic> => {
    try {
      const response = await apiClient.put<Topic>(`/admin/topics/${id}`, { name, description, version });
      return response;
    } catch (error) {
      console.error(`Error updating topic ${id}:`, error);
      throw error;
    }
  },

  deleteTopic: async (id: string, version: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/topics/${id}`, { data: { version } });
    } catch (error) {
      console.error(`Error deleting topic ${id}:`, error);
      throw error;
    }
  },
  
  searchTemplates: async (query: string): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>(`/admin/templates/search?query=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      console.error('Error searching templates as admin:', error);
      try {
        const response = await apiClient.get<Template[]>(`/templates/search?query=${encodeURIComponent(query)}`);
        return response;
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return [];
      }
    }
  },
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>('/admin/stats');
      return response;
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
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

  getSystemActivity: async (limit: number = 10): Promise<SystemActivity[]> => {
    try {
      const url = limit ? `/admin/activity?limit=${limit}` : '/admin/activity';
      const response = await apiClient.get<SystemActivity[]>(url);
      return response;
    } catch (error) {
      console.error('Error fetching system activity:', error);
      return [];
    }
  }
};

export { adminService };
export default adminService;