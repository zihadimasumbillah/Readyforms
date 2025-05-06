import apiClient from './api-client';

export interface LikeResponse {
  liked: boolean;
  message?: string;
}

export interface LikeCount {
  count: number;
}

export interface LikeData {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LikesResponse {
  templateId: string;
  likesCount: number;
  likes: LikeData[];
}

// Toggle like status for a template
export const toggleLike = async (templateId: string): Promise<LikeResponse> => {
  try {
    // The backend uses same endpoint for both like and unlike
    const response = await apiClient.post<LikeResponse>(`/likes/template/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling like for template ${templateId}:`, error);
    throw error;
  }
};

// Unlike a template
export const unlikeTemplate = async (templateId: string): Promise<LikeResponse> => {
  try {
    const response = await apiClient.delete<LikeResponse>(`/likes/template/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unliking template ${templateId}:`, error);
    throw error;
  }
};

// Check if current user has liked a template
export const checkLike = async (templateId: string): Promise<LikeResponse> => {
  try {
    const response = await apiClient.get<LikeResponse>(`/likes/check/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error checking like status for template ${templateId}:`, error);
    throw error;
  }
};

// Get like count for a template
export const getLikeCount = async (templateId: string): Promise<LikeCount> => {
  try {
    const response = await apiClient.get<LikeCount>(`/likes/count/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting like count for template ${templateId}:`, error);
    throw error;
  }
};

// Get likes for a template
export const getLikesByTemplate = async (templateId: string): Promise<LikesResponse> => {
  try {
    const response = await apiClient.get<LikesResponse>(`/likes/template/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting likes for template ${templateId}:`, error);
    throw error;
  }
};