import { apiClient } from './api-client';

export interface Tag {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagWithCount extends Tag {
  template_count?: number;
  like_count?: number;
}

export const tagService = {
  /**
   * Get all tags
   */
  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get('/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching all tags:', error);
      return [];
    }
  },

  /**
   * Get popular tags (tags used in most templates)
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
   * Get famous tags (tags with the most likes)
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
   * Get recent tags (from recently created templates)
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
   * Get templates by tag ID
   * @param tagId - The ID of the tag
   */
  async getTemplatesByTag(tagId: number) {
    try {
      const response = await apiClient.get(`/tags/${tagId}/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates by tag:', error);
      return [];
    }
  },

  /**
   * Add a tag to a template
   * @param tagId - The ID of the tag to add
   * @param templateId - The ID of the template
   */
  async addTagToTemplate(tagId: number, templateId: string) {
    try {
      const response = await apiClient.post('/tags/template', { tagId, templateId });
      return response.data;
    } catch (error) {
      console.error('Error adding tag to template:', error);
      throw error;
    }
  },

  /**
   * Remove a tag from a template
   * @param tagId - The ID of the tag to remove
   * @param templateId - The ID of the template
   */
  async removeTagFromTemplate(tagId: number, templateId: string) {
    try {
      const response = await apiClient.delete('/tags/template', { 
        data: { tagId, templateId }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing tag from template:', error);
      throw error;
    }
  },

  /**
   * Create a new tag (admin only)
   * @param name - The name of the tag
   */
  async createTag(name: string) {
    try {
      const response = await apiClient.post('/tags', { name });
      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },

  /**
   * Delete a tag (admin only)
   * @param id - The ID of the tag to delete
   */
  async deleteTag(id: number) {
    try {
      const response = await apiClient.delete(`/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }
};