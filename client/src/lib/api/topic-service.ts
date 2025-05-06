import apiClient from './api-client';
import { Topic } from '@/types';

// Get all topics
export const getAllTopics = async (): Promise<Topic[]> => {
  try {
    const response = await apiClient.get<Topic[]>('/topics');
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

// Get topic by ID
export const getTopicById = async (id: string): Promise<Topic> => {
  try {
    const response = await apiClient.get<Topic>(`/topics/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching topic ${id}:`, error);
    throw error;
  }
};

// Create a new topic (admin only)
export const createTopic = async (topicData: { name: string; description?: string }): Promise<Topic> => {
  try {
    const response = await apiClient.post<Topic>('/topics', topicData);
    return response.data;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// Update a topic (admin only)
export const updateTopic = async (id: string, topicData: { name: string; description?: string }, version: number): Promise<Topic> => {
  try {
    const data = { ...topicData, version };
    const response = await apiClient.put<Topic>(`/topics/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating topic ${id}:`, error);
    throw error;
  }
};

// Delete a topic (admin only)
export const deleteTopic = async (id: string, version: number): Promise<void> => {
  try {
    await apiClient.delete(`/topics/${id}`, { data: { version } });
  } catch (error) {
    console.error(`Error deleting topic ${id}:`, error);
    throw error;
  }
};

export default {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic
};