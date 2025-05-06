import apiClient from './api-client';

interface Comment {
  id: string;
  content: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

const commentService = {
  /**
   * Get all comments for a template
   */
  getCommentsByTemplate: async (templateId: string): Promise<Comment[]> => {
    try {
      return await apiClient.get<Comment[]>(`/comments/template/${templateId}`);
    } catch (error) {
      console.error(`Get comments error for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new comment
   */
  createComment: async (templateId: string, content: string): Promise<Comment> => {
    try {
      return await apiClient.post<Comment>('/comments', { templateId, content });
    } catch (error) {
      console.error(`Create comment error for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: string, version: number): Promise<void> => {
    try {
      await apiClient.delete(`/comments/${commentId}`, { 
        data: { version } 
      });
    } catch (error) {
      console.error(`Delete comment error for comment ${commentId}:`, error);
      throw error;
    }
  }
};

export default commentService;