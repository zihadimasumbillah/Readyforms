import apiClient from './api-client';
import { Topic } from '@/types';

/**
 * Service for topic-related API operations
 */
const topicService = {
  /**
   * Get all topics
   */
  getAllTopics: async (): Promise<Topic[]> => {
    try {
      const response = await apiClient.get<Topic[]>('/topics');
      
      // Ensure we return an array
      if (!Array.isArray(response)) {
        console.warn('API response for topics is not an array:', response);
        return [];
      }
      return response;
    } catch (error) {
      console.error('Get all topics error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  /**
   * Get topic by ID
   */
  getTopicById: async (id: string): Promise<Topic> => {
    try {
      return await apiClient.get<Topic>(`/topics/${id}`);
    } catch (error) {
      console.error(`Get topic ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create a new topic (admin only)
   */
  createTopic: async (topicData: Partial<Topic>): Promise<Topic> => {
    try {
      return await apiClient.post<Topic>('/topics', topicData);
    } catch (error) {
      console.error('Create topic error:', error);
      throw error;
    }
  },

  /**
   * Update an existing topic (admin only)
   */
  updateTopic: async (id: string, topicData: Partial<Topic>, version: number): Promise<Topic> => {
    try {
      // Include version for optimistic locking
      const data = { ...topicData, version };
      return await apiClient.put<Topic>(`/topics/${id}`, data);
    } catch (error) {
      console.error(`Update topic ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Delete a topic (admin only)
   */
  deleteTopic: async (id: string, version: number): Promise<void> => {
    try {
      // Include version for optimistic locking
      const data = { version };
      await apiClient.delete(`/topics/${id}`, { data });
    } catch (error) {
      console.error(`Delete topic ${id} error:`, error);
      throw error;
    }
  }
};

// Export both named and default export to be compatible with different import patterns
export { topicService };
export default topicService;