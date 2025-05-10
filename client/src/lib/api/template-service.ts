import apiClient from './api-client';
import { Template } from '@/types';

/**
 * Type for template create data
 */
export interface TemplateCreateData {
  title: string;
  description: string;
  isPublic: boolean;
  topicId: string;
  tags?: string[];
  customString1State?: boolean;
  customString1Question?: string;
  customString2State?: boolean;
  customString2Question?: string;
  customString3State?: boolean;
  customString3Question?: string;
  customString4State?: boolean;
  customString4Question?: string;
  customText1State?: boolean;
  customText1Question?: string;
  customText2State?: boolean;
  customText2Question?: string;
  customText3State?: boolean;
  customText3Question?: string;
  customText4State?: boolean;
  customText4Question?: string;
  customInt1State?: boolean;
  customInt1Question?: string;
  customInt2State?: boolean;
  customInt2Question?: string;
  customInt3State?: boolean;
  customInt3Question?: string;
  customInt4State?: boolean;
  customInt4Question?: string;
  customCheckbox1State?: boolean;
  customCheckbox1Question?: string;
  customCheckbox2State?: boolean;
  customCheckbox2Question?: string;
  customCheckbox3State?: boolean;
  customCheckbox3Question?: string;
  customCheckbox4State?: boolean;
  customCheckbox4Question?: string;
  questionOrder?: string;
  isQuiz?: boolean;
  showScoreImmediately?: boolean;
  scoringCriteria?: any;
  // Add index signature to allow dynamic property access with string keys
  [key: string]: string | boolean | string[] | number | any | undefined;
}

/**
 * Type for template update data
 */
export interface TemplateUpdateData extends TemplateCreateData {
  version: number;
}

export const templateService = {
  /**
   * Get all public templates
   */
  async getTemplates(params?: { 
    limit?: number; 
    page?: number;
    query?: string;
    topicId?: string;
    tag?: string;
    sort?: 'newest' | 'oldest' | 'popular';
  }): Promise<Template[]> {
    try {
      const response = await apiClient.get('/templates', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },
  
  /**
   * Get a specific template by ID
   */
  async getTemplateById(id: string): Promise<Template | null> {
    try {
      const response = await apiClient.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Search templates
   */
  async searchTemplates(query: string, options?: {
    limit?: number;
    page?: number;
    topicId?: string;
    tag?: string;
    sort?: 'newest' | 'oldest' | 'popular';
  }): Promise<Template[]> {
    try {
      const params = { 
        query, 
        limit: options?.limit || 10,
        page: options?.page || 1,
        topicId: options?.topicId,
        tag: options?.tag,
        sort: options?.sort || 'newest'
      };
      
      const response = await apiClient.get('/templates/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching templates:', error);
      return [];
    }
  },
  
  /**
   * Get featured/recommended templates for homepage
   */
  async getFeaturedTemplates(limit = 6): Promise<Template[]> {
    try {
      // For now, just return the latest templates as featured
      const response = await apiClient.get('/templates', { 
        params: { limit, page: 1 } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured templates:', error);
      return [];
    }
  },
  
  /**
   * Get templates by topic
   */
  async getTemplatesByTopic(topicId: string, params?: {
    limit?: number;
    page?: number;
  }): Promise<Template[]> {
    try {
      const response = await apiClient.get('/templates/search', { 
        params: { 
          topicId,
          limit: params?.limit || 10,
          page: params?.page || 1
        } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching templates for topic ${topicId}:`, error);
      return [];
    }
  },

  /**
   * Delete a template
   */
  async deleteTemplate(id: string, version: number): Promise<boolean> {
    try {
      await apiClient.delete(`/templates/${id}`, {
        data: { version }
      });
      return true;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new template
   */
  async createTemplate(templateData: TemplateCreateData): Promise<Template | null> {
    try {
      const response = await apiClient.post('/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  /**
   * Update a template
   */
  async updateTemplate(id: string, templateData: TemplateUpdateData): Promise<Template | null> {
    try {
      const response = await apiClient.put(`/templates/${id}`, templateData);
      return response.data.template;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error;
    }
  }
};

export default templateService;