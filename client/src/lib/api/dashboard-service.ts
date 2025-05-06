import apiClient from './api-client';

export interface UserStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}

const dashboardService = {
  /**
   * Get user dashboard stats
   */
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await apiClient.get<UserStats>('/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Get user stats error:', error);
      // Return default stats on error
      return {
        templates: 0,
        responses: 0,
        likes: 0,
        comments: 0
      };
    }
  },

  /**
   * Get user templates
   */
  getUserTemplates: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>('/dashboard/templates');
      // Ensure we always return an array even if the API fails or returns undefined
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

  /**
   * Get user's form responses
   */
  getUserResponses: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>('/dashboard/responses');
      // Ensure we always return an array even if the API fails
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

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit: number = 5): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(`/dashboard/activity?limit=${limit}`);
      // Ensure we always return an array even if the API fails
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

  /**
   * Delete a template
   */
  deleteTemplate: async (id: string, version: number): Promise<void> => {
    try {
      // Version must be included for optimistic locking
      const data = { version };
      await apiClient.delete(`/templates/${id}`, { data });
    } catch (error) {
      console.error(`Delete template ${id} error:`, error);
      throw error;
    }
  },
};

// Export both as default and named export
export { dashboardService };
export default dashboardService;