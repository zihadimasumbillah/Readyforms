import apiClient from './api-client';
import { Tag as BaseTag } from '@/types';

export interface TagWithCount extends BaseTag {
  template_count?: number;
  like_count?: number;
  latest_template?: string;
}

export type Tag = BaseTag;

export const tagService = {

  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get('/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },

  /**
   * @param limit - Maximum number of tags to return
   */
  async getPopularTags(limit: number = 10): Promise<TagWithCount[]> {
    try {
      const response = await apiClient.get(`/tags/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  },
  
  /**
   * @param limit - Maximum number of tags to return
   */
  async getFamousTags(limit: number = 10): Promise<TagWithCount[]> {
    try {
      const response = await apiClient.get(`/tags/famous?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching famous tags:', error);
      return [];
    }
  },
  
  /**
   * @param limit - Maximum number of tags to return
   */
  async getRecentTags(limit: number = 10): Promise<TagWithCount[]> {
    try {
      const response = await apiClient.get(`/tags/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent tags:', error);
      return [];
    }
  },
  
  /**
   * @param tagId - ID of the tag to get templates for
   */
  async getTemplatesByTag(tagId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/tags/${tagId}/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates by tag:', error);
      return [];
    }
  }
};

export default tagService;