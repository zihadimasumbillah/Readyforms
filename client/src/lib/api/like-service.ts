import apiClient from './api-client';

const likeService = {
  /**
   * Check if current user has liked a template
   */
  checkLike: async (templateId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/likes/check/${templateId}`);
      return response.liked;
    } catch (error) {
      console.error(`Check like error for template ${templateId}:`, error);
      return false;
    }
  },

  /**
   * Get like count for a template
   */
  getLikeCount: async (templateId: string): Promise<number> => {
    try {
      const response = await apiClient.get(`/likes/count/${templateId}`);
      return response.count;
    } catch (error) {
      console.error(`Get like count error for template ${templateId}:`, error);
      return 0;
    }
  },

  /**
   * Like a template
   */
  likeTemplate: async (templateId: string): Promise<void> => {
    try {
      await apiClient.post(`/likes/template/${templateId}`);
    } catch (error) {
      console.error(`Like template error for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Unlike a template
   */
  unlikeTemplate: async (templateId: string): Promise<void> => {
    try {
      await apiClient.delete(`/likes/template/${templateId}`);
    } catch (error) {
      console.error(`Unlike template error for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle like for a template
   */
  toggleLike: async (templateId: string, isCurrentlyLiked: boolean): Promise<boolean> => {
    try {
      if (isCurrentlyLiked) {
        await apiClient.delete(`/likes/template/${templateId}`);
        return false;
      } else {
        await apiClient.post(`/likes/template/${templateId}`);
        return true;
      }
    } catch (error) {
      console.error(`Toggle like error for template ${templateId}:`, error);
      throw error;
    }
  }
};

export default likeService;