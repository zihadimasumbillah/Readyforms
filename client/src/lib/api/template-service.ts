import apiClient from './api-client';
import { Template } from '@/types';

export const templateService = {
  // Get all templates
  getAllTemplates: async (): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>('/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },
  
  // Get template by ID
  getTemplateById: async (id: string): Promise<Template> => {
    try {
      const response = await apiClient.get<Template>(`/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
    }
  },
  
  // Get popular templates
  getPopularTemplates: async (limit: number = 5): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>(`/templates/popular?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular templates');
    }
  },
  
  // Create a new template
  createTemplate: async (templateData: any): Promise<Template> => {
    try {
      const response = await apiClient.post<Template>('/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },
  
  // Update a template
  updateTemplate: async (id: string, templateData: any, version: number): Promise<Template> => {
    try {
      // Make sure version is included for optimistic locking
      const data = { ...templateData, version };
      const response = await apiClient.put<Template>(`/templates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a template
  deleteTemplate: async (id: string, version: number): Promise<void> => {
    try {
      await apiClient.delete(`/templates/${id}`, { data: { version } });
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  },
  
  // Search for templates
  searchTemplates: async (query: string): Promise<Template[]> => {
    try {
      const response = await apiClient.get<Template[]>(`/templates/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching templates with query "${query}":`, error);
      throw error;
    }
  }
};

// Export individual functions for convenience
export const { 
  getAllTemplates, 
  getTemplateById, 
  getPopularTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  searchTemplates
} = templateService;