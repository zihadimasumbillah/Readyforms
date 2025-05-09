import apiClient from './api-client';

export interface UserStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}

const dashboardService = {
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await apiClient.get<UserStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        templates: 0,
        responses: 0,
        likes: 0,
        comments: 0
      };
    }
  },

  getUserTemplates: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>('/dashboard/templates');
      if (!response || !Array.isArray(response)) {
        console.warn('API returned invalid data for templates:', response);
        return [];
      }
      return response;
    } catch (error) {
      console.error('Get user templates error:', error);
      return [];
    }
  },

  getUserResponses: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>('/dashboard/responses');
      if (!response || !Array.isArray(response)) {
        console.warn('API returned invalid data for responses:', response);
        return [];
      }
      return response;
    } catch (error) {
      console.error('Get user responses error:', error);
      return [];
    }
  },

  getRecentActivity: async (limit: number = 5): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(`/dashboard/activity?limit=${limit}`);
      if (!response || !Array.isArray(response)) {
        console.warn('API returned invalid data for activity:', response);
        return [];
      }
      return response;
    } catch (error) {
      console.error('Get recent activity error:', error);
      return [];
    }
  },

  deleteTemplate: async (id: string, version: number): Promise<void> => {
    try {
      const data = { version };
      await apiClient.delete(`/templates/${id}`, { data });
    } catch (error) {
      console.error(`Delete template ${id} error:`, error);
      throw error;
    }
  },
};

export { dashboardService };
export default dashboardService;