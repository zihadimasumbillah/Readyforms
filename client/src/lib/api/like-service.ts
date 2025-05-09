import apiClient from './api-client';

export interface LikeStatus {
  liked: boolean;
}

export interface LikeCount {
  count: number;
}

export interface LikeResponse {
  message: string;
  liked: boolean;
}

export const likeService = {
  /**
   * Check if the current user has liked a template
   * @param templateId The ID of the template to check
   */
  async checkLike(templateId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<LikeStatus>(`/likes/check/${templateId}`);
      return response.data.liked;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  },
  
  /**
   * Get the number of likes for a template
   * @param templateId The ID of the template
   */
  async getLikeCount(templateId: string): Promise<number> {
    try {
      const response = await apiClient.get<LikeCount>(`/likes/count/${templateId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting like count:', error);
      return 0;
    }
  },
  
  /**
   * Toggle like status for a template (like or unlike)
   * @param templateId The ID of the template to toggle like status
   */
  async toggleLike(templateId: string): Promise<LikeResponse> {
    try {
      // First check if already liked
      const isLiked = await this.checkLike(templateId);
      
      if (isLiked) {
        // If liked, unlike it
        const response = await apiClient.delete<LikeResponse>(`/likes/template/${templateId}`);
        return response.data;
      } else {
        // If not liked, like it
        const response = await apiClient.post<LikeResponse>(`/likes/template/${templateId}`);
        return response.data;
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      throw error.response?.data || { message: 'Failed to update like status' };
    }
  },

  /**
   * Get all likes for a template (admin only)
   * @param templateId The ID of the template
   */
  async getLikesByTemplate(templateId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/likes/template/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting likes by template:', error);
      throw error;
    }
  }
};

export default likeService;