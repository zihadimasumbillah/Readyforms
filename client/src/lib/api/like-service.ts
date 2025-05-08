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
}

// Create and export service instance
const likeService = new LikeService();

// Export both the class and the instance
export { LikeService, likeService };
export default likeService;