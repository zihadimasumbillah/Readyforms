import apiClient from './api-client';

export const likeService = {
  /**
   * Like a template
   */
  async likeTemplate(templateId: string): Promise<{ liked: boolean }> {
    try {
      const response = await apiClient.post(`/likes/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to like template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Unlike a template
   */
  async unlikeTemplate(templateId: string): Promise<{ liked: boolean }> {
    try {
      const response = await apiClient.delete(`/likes/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to unlike template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Check if user has liked a template
   */
  async checkLikeStatus(templateId: string): Promise<{ liked: boolean }> {
    try {
      const response = await apiClient.get(`/likes/check/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to check like status for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Count likes for a template
   */
  async getLikesCount(templateId: string): Promise<{ count: number }> {
    try {
      const response = await apiClient.get(`/likes/count/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to get likes count for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Get likes by template
   */
  async getLikesByTemplate(templateId: string): Promise<{ likesCount: number, likes: any[] }> {
    try {
      const response = await apiClient.get(`/likes/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to get likes for template ${templateId}:`, error);
      throw error;
    }
  }
};

export default likeService;