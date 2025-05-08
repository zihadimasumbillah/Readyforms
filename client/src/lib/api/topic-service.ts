import apiClient from './api-client';
import { Topic } from '@/types';

class TopicService {
  async getAllTopics() {
    const response = await apiClient.get<Topic[]>('/topics');
    return response.data;
  }

  async getTopicById(id: string) {
    const response = await apiClient.get<Topic>(`/topics/${id}`);
    return response.data;
  }

  async createTopic(topicData: Partial<Topic>) {
    const response = await apiClient.post<Topic>('/topics', topicData);
    return response.data;
  }

  async updateTopic(id: string, topicData: Partial<Topic> & { version: number }) {
    const response = await apiClient.put<Topic>(`/topics/${id}`, topicData);
    return response.data;
  }

  async deleteTopic(id: string, version: number) {
    const response = await apiClient.delete(`/topics/${id}`, {
      data: { version }
    });
    return response.data;
  }
}

// Create and export service instance
const topicService = new TopicService();

// Export both the class and the instance
export { TopicService, topicService };
export default topicService;