import apiClient from './api-client';
import { Comment } from '@/types';

export const commentService = {
  /**
   * Get comments for a template
   */
  async getCommentsByTemplate(templateId: string): Promise<Comment[]> {
    try {
      const response = await apiClient.get(`/comments/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch comments for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Create a comment
   */
  async createComment(templateId: string, content: string): Promise<Comment> {
    try {
      const response = await apiClient.post('/comments', { templateId, content });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, version: number): Promise<void> {
    try {
      await apiClient.delete(`/comments/${commentId}`, {
        data: { version }
      });
    } catch (error: any) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw error;
    }
  }
};

export default commentService;