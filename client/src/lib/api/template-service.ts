import apiClient from './api-client';
import { Template } from '@/types';

// Add the TemplateCreateData interface
export interface TemplateCreateData {
  title: string;
  description: string;
  isPublic: boolean;
  topicId: string;
  tags: string[];
  isQuiz?: boolean;
  showScoreImmediately?: boolean;
  scoringCriteria?: string;
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
  [key: string]: string | boolean | string[] | undefined;
}

export interface TemplateUpdateData {
  title: string;
  description: string;
  isPublic: boolean;
  topicId: string;
  tags: string[];
  version: number;
  isQuiz?: boolean;
  showScoreImmediately?: boolean;
  scoringCriteria?: string;
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
  [key: string]: string | boolean | string[] | number | undefined;
}

export const templateService = {
  /**
   * Get all templates
   */
  async getAllTemplates(page = 1, limit = 10): Promise<Template[]> {
    try {
      const response = await apiClient.get(`/templates?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  },

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<Template> {
    try {
      const response = await apiClient.get(`/templates/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create template
   */
  async createTemplate(templateData: any): Promise<Template> {
    try {
      const response = await apiClient.post('/templates', templateData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create template:', error);
      throw error;
    }
  },

  /**
   * Update template
   */
  async updateTemplate(id: string, templateData: any): Promise<Template> {
    try {
      const response = await apiClient.put(`/templates/${id}`, templateData);
      return response.data.template;
    } catch (error: any) {
      console.error(`Failed to update template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete template
   */
  async deleteTemplate(id: string, version: number): Promise<void> {
    try {
      await apiClient.delete(`/templates/${id}`, {
        data: { version }
      });
    } catch (error: any) {
      console.error(`Failed to delete template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search templates
   */
  async searchTemplates(searchParams: {
    query?: string;
    tag?: string;
    topicId?: string;
    limit?: number;
    page?: number;
    sort?: 'newest' | 'oldest' | 'popular';
  }): Promise<Template[]> {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.query) params.append('query', searchParams.query);
      if (searchParams.tag) params.append('tag', searchParams.tag);
      if (searchParams.topicId) params.append('topicId', searchParams.topicId);
      if (searchParams.limit) params.append('limit', searchParams.limit.toString());
      if (searchParams.page) params.append('page', searchParams.page.toString());
      if (searchParams.sort) params.append('sort', searchParams.sort);
      
      const response = await apiClient.get(`/templates/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to search templates:', error);
      throw error;
    }
  }
};

export default templateService;