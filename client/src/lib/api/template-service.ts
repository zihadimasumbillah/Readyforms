import apiClient from './api-client';
import { Template } from '@/types';

const templateService = {
  /**
   * Get all templates
   */
  getAllTemplates: async (): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>('/templates');
      return response;
    } catch (error) {
      console.error('Get all templates error:', error);
      return [];
    }
  },
  
  /**
   * Get template by ID
   */
  getTemplateById: async (id: string): Promise<Template> => {
    try {
      const response = await apiClient.get<Template>(`/templates/${id}`);
      return response;
    } catch (error) {
      console.error(`Get template ${id} error:`, error);
      throw error;
    }
  },
  
  /**
   * Create a template
   */
  createTemplate: async (templateData: any): Promise<Template> => {
    try {
      const response = await apiClient.post<Template>('/templates', templateData);
      return response;
    } catch (error) {
      console.error('Create template error:', error);
      throw error;
    }
  },
  
  /**
   * Update a template
   */
  updateTemplate: async (id: string, templateData: any): Promise<Template> => {
    try {
      const response = await apiClient.put<Template>(`/templates/${id}`, templateData);
      return response;
    } catch (error) {
      console.error(`Update template ${id} error:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a template
   */
  deleteTemplate: async (id: string, version: number): Promise<void> => {
    try {
      // Version must be included for optimistic locking
      const data = { version };
      await apiClient.delete(`/templates/${id}`, { data });
    } catch (error) {
      console.error(`Delete template ${id} error:`, error);
      throw error;
    }
  },
  
  /**
   * Search for templates
   */
  searchTemplates: async (query: string): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>(`/templates/search?query=${encodeURIComponent(query)}`);
      // Ensure we return an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Search templates error:`, error);
      return []; // Return empty array instead of throwing
    }
  }
};

// Export both as default and named export
export { templateService };
export default templateService;