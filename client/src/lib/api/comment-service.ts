import apiClient from './api-client';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  templateId: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface CreateCommentRequest {
  templateId: string;
  content: string;
}

export const commentService = {
  /**
   * @param templateId The ID of the template
   */
  async getCommentsByTemplate(templateId: string): Promise<Comment[]> {
    try {
      const response = await apiClient.get<Comment[]>(`/comments/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },
  
  /**
   * @param comment The comment data
   */
  async createComment(comment: CreateCommentRequest): Promise<Comment> {
    try {
      const response = await apiClient.post<Comment>('/comments', comment);
      return response.data;
    } catch (error: any) {
      console.error('Error creating comment:', error);
      throw error.response?.data || { message: 'Failed to create comment' };
    }
  },
  
  /**
   * @param commentId The ID of the comment to delete
   * @param version The version of the comment for optimistic locking
   */
  async deleteComment(commentId: string, version: number): Promise<void> {
    try {
      await apiClient.delete(`/comments/${commentId}`, {
        data: { version }
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw error.response?.data || { message: 'Failed to delete comment' };
    }
  }
};

export default commentService;