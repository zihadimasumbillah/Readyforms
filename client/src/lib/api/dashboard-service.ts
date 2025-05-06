import apiClient from './api-client';
import { Template } from '@/types';

// Types for dashboard data
interface UserStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}

interface ResponsesData {
  recent: Array<{
    id: string;
    templateId: string;
    templateTitle: string;
    createdAt: string;
  }>;
  total: number;
}

export const dashboardService = {
  // Get user's dashboard statistics
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await apiClient.get<UserStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return default values if API fails
      return {
        templates: 0,
        responses: 0,
        likes: 0,
        comments: 0
      };
    }
  },

  // Get user's templates
  getUserTemplates: async (): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>('/dashboard/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching user templates:', error);
      // If the API fails, try fetching from the templates endpoint as a fallback
      try {
        const fallbackResponse = await apiClient.get<Template[]>('/templates/user');
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
        return [];
      }
    }
  },

  // Get user's recent form responses
  getResponsesData: async (): Promise<ResponsesData> => {
    try {
      const response = await apiClient.get<ResponsesData>('/dashboard/responses');
      return response.data;
    } catch (error) {
      console.error('Error fetching response data:', error);
      return {
        recent: [],
        total: 0
      };
    }
  },

  // Get popular templates
  getPopularTemplates: async (limit: number = 5): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>(`/dashboard/popular-templates?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      return [];
    }
  },

  // Get dashboard activity
  getActivity: async () => {
    try {
      const response = await apiClient.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }
};

export default dashboardService;