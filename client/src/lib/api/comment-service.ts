import apiClient from './api-client';

export interface Comment {
  id: string;
  userId: string;
  templateId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

// Get comments by template ID
export const getCommentsByTemplate = async (templateId: string): Promise<Comment[]> => {
  try {
    const response = await apiClient.get<Comment[]>(`/comments/template/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for template ${templateId}:`, error);
    throw error;
  }
};

// Create a new comment
export const createComment = async (templateId: string, content: string): Promise<Comment> => {
  try {
    const response = await apiClient.post<Comment>('/comments', { templateId, content });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string, version: number): Promise<void> => {
  try {
    await apiClient.delete(`/comments/${commentId}`, {
      data: { version }
    });
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

export default {
  getCommentsByTemplate,
  createComment,
  deleteComment
};