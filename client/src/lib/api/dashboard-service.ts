import apiClient from './api-client';
import { Template, FormResponse } from '@/types';

interface UserStats {
  templates: number;
  responses: number;
  likes: number;
  comments: number;
}

export const dashboardService = {
  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get('/dashboard/stats');
      const data = response.data;
      const respVal = typeof data.responses === 'number' 
        ? data.responses 
        : ((data.responses?.submitted || 0) + (data.responses?.received || 0));
      const likesVal = typeof data.likes === 'number' ? data.likes : (data.social?.likes || 0);
      const commentsVal = typeof data.comments === 'number' ? data.comments : (data.social?.comments || 0);

      return {
        templates: Number(data.templates || 0),
        responses: Number(respVal || 0),
        likes: Number(likesVal || 0),
        comments: Number(commentsVal || 0),
      };
    } catch (error: any) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 5): Promise<any[]> {
    try {
      const response = await apiClient.get(`/dashboard/recent?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch recent activity:', error);
      throw error;
    }
  },

  /**
   * Get user templates
   */
  async getUserTemplates(): Promise<Template[]> {
    try {
      const response = await apiClient.get('/dashboard/templates');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user templates:', error);
      throw error;
    }
  },

  /**
   * Get user responses
   */
  async getUserResponses(): Promise<FormResponse[]> {
    try {
      const response = await apiClient.get('/dashboard/responses');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user responses:', error);
      throw error;
    }
  },

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string, version: number): Promise<void> {
    try {
      await apiClient.delete(`/templates/${templateId}`, {
        data: { version }
      });
    } catch (error: any) {
      console.error(`Failed to delete template ${templateId}:`, error);
      throw error;
    }
  }
};

export default dashboardService;