import apiClient from './api-client';
import { Template } from '@/types';

export interface TemplateCreateData {
  title: string;
  topicId: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  isQuiz?: boolean;
  showScoreImmediately?: boolean;
  scoringCriteria?: string;
  questionOrder?: string;
  [key: string]: any; 
}

export interface TemplateUpdateData extends Partial<Omit<Template, 'tags'>> {
  title: string;
  topicId: string;
  version: number; 
  tags?: string[]; 
  [key: string]: any; 
}

export interface TemplateListOptions {
  query?: string;
  tag?: string;
  topicId?: string;
  limit?: number;
  page?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

export const templateService = {
  
  async getAllTemplates(options?: TemplateListOptions): Promise<Template[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.query) queryParams.append('query', options.query);
      if (options?.tag) queryParams.append('tag', options.tag);
      if (options?.topicId) queryParams.append('topicId', options.topicId);
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.sort) queryParams.append('sort', options.sort);

      const queryString = queryParams.toString();
      const url = queryString ? `/templates/search?${queryString}` : '/templates';
      
      const response = await apiClient.get<Template[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },
  
  /**
   * @param id - Template ID
   */
  async getTemplateById(id: string): Promise<Template> {
    const response = await apiClient.get<Template>(`/templates/${id}`);
    return response.data;
  },

  /**
   * @param id - Template ID
   */
  async getById(id: string): Promise<Template> {
    return this.getTemplateById(id);
  },
  
  /**
   * @param templateData - Template data
   */
  async createTemplate(templateData: TemplateCreateData): Promise<Template> {
    const response = await apiClient.post<Template>('/templates', templateData);
    return response.data;
  },
  
  /**
   * @param id - Template ID
   * @param data - Updated template data
   */
  async updateTemplate(id: string, data: TemplateUpdateData): Promise<Template> {
    const response = await apiClient.put<Template>(`/templates/${id}`, data);
    return response.data;
  },
  
  /**
   * @param id - Template ID
   * @param version - Template version for optimistic locking
   */
  async deleteTemplate(id: string, version: number): Promise<void> {
    await apiClient.delete(`/templates/${id}`, {
      data: { version }
    });
  },
  
  /**
   * @param query - Search query
   * @param options - Additional search options
   */
  async searchTemplates(query: string, options?: Omit<TemplateListOptions, 'query'>): Promise<Template[]> {
    try {
      const queryParams = new URLSearchParams({ query });
      if (options?.tag) queryParams.append('tag', options.tag);
      if (options?.topicId) queryParams.append('topicId', options.topicId);
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.sort) queryParams.append('sort', options.sort);
      
      const response = await apiClient.get<Template[]>(`/templates/search?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching templates:', error);
      return [];
    }
  }
};

export default templateService;