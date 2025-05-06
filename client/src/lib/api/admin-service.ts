import apiClient from './api-client';
import { Template, Topic, User } from '@/types';

export interface SystemActivity {
  id: string;
  type: 'template' | 'response' | 'user' | 'like';
  action: string;
  title?: string;
  user: string;
  timestamp: string;
}

// Export the service as a default export and as a named export for flexibility
const adminService = {
  // Toggle user block status (admin only)
  toggleUserBlock: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{user: User}>(`/users/${userId}/block`);
      return response.user;
    } catch (error) {
      console.error('Error toggling user block status:', error);
      throw error;
    }
  },

  // Toggle user admin status (admin only)
  toggleUserAdmin: async (userId: string): Promise<User> => {
    try {
      const response = await apiClient.put<{user: User}>(`/users/${userId}/admin`);
      return response.user;
    } catch (error) {
      console.error('Error toggling user admin status:', error);
      throw error;
    }
  },

  // Get all templates (admin only)
  getAllTemplates: async (): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>('/admin/templates');
      return response;
    } catch (error) {
      console.error('Error fetching all templates:', error);
      // If admin endpoint fails, try to get all templates from regular endpoint
      try {
        const response = await apiClient.get<Template[]>('/templates');
        return response;
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
        return [];
      }
    }
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/users');
      return response;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  },

  // Get all topics (admin only for full access)
  getAllTopics: async (): Promise<Topic[]> => {
    try {
      const response = await apiClient.get<Topic[]>('/topics');
      return response;
    } catch (error) {
      console.error('Error fetching topics:', error);
      return [];
    }
  },

  // Create a new topic (admin only)
  createTopic: async (name: string, description?: string): Promise<Topic> => {
    try {
      const response = await apiClient.post<Topic>('/topics', { name, description });
      return response;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  },

  // Update a topic (admin only)
  updateTopic: async (id: string, name: string, description: string, version: number): Promise<Topic> => {
    try {
      const response = await apiClient.put<Topic>(`/topics/${id}`, { name, description, version });
      return response;
    } catch (error) {
      console.error(`Error updating topic ${id}:`, error);
      throw error;
    }
  },

  // Delete a topic (admin only)
  deleteTopic: async (id: string, version: number): Promise<void> => {
    try {
      await apiClient.delete(`/topics/${id}`, { data: { version } });
    } catch (error) {
      console.error(`Error deleting topic ${id}:`, error);
      throw error;
    }
  },

  // Get admin dashboard stats
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
  
  // Get system activity for admin dashboard
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

// Export both as default and named export
export { adminService };
export default adminService;