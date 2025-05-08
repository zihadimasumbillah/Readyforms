import apiClient from './api-client';

interface LikeResponse {
  liked: boolean;
  message?: string;
}

interface LikesCountResponse {
  count: number;
}

interface LikesByTemplateResponse {
  templateId: string;
  likesCount: number;
  likes: any[];
}

interface LikeCountResponse {
  count: number;
}

interface LikeStatusResponse {
  liked: boolean;
}

class LikeService {
  async toggleLike(templateId: string): Promise<LikeResponse> {
    try {
      const response = await apiClient.post<LikeResponse>(`/likes/template/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  async checkLike(templateId: string): Promise<LikeResponse> {
    try {
      const response = await apiClient.get<LikeResponse>(`/likes/check/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking like:', error);
      throw error;
    }
  }

  async countLikes(templateId: string): Promise<LikesCountResponse> {
    try {
      const response = await apiClient.get<LikesCountResponse>(`/likes/count/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error counting likes:', error);
      throw error;
    }
  }

  async getLikesByTemplate(templateId: string): Promise<LikesByTemplateResponse> {
    try {
      const response = await apiClient.get<LikesByTemplateResponse>(`/likes/template/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting likes by template:', error);
      throw error;
    }
  }

  /**
   * Get the number of likes for a template
   * @param templateId - The ID of the template
   * @returns Promise with the number of likes
   */
  async getLikeCount(templateId: string): Promise<number> {
    try {
      const response = await apiClient.get<LikeCountResponse>(`/likes/count/${templateId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting like count:', error);
      return 0;
    }
  }

  /**
   * Check if the current logged-in user has liked a template
   * @param templateId - The ID of the template
   * @returns Promise with a boolean indicating if the user has liked the template
   */
  async checkLikeStatus(templateId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<LikeStatusResponse>(`/likes/check/${templateId}`);
      return response.data.liked;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }
}

// Create and export service instance
const likeService = new LikeService();

// Export both the class and the instance
export { LikeService, likeService };
export default likeService;