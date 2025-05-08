import apiClient from './api-client';
import { FormResponse } from '@/types';

// Define interface for form response create data
export interface FormResponseCreateData {
  templateId: string;
  answers: {
    [key: string]: string | number | boolean;
  };
}

export const formResponseService = {
  /**
   * Get form response by ID
   * @param id - The ID of the form response
   * @returns Promise with form response
   */
  getResponseById: async (id: string): Promise<FormResponse> => {
    try {
      const response = await apiClient.get<FormResponse>(`/form-responses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting form response ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get form responses for a specific template
   * @param templateId - The ID of the template
   * @returns Promise with array of form responses
   */
  getResponsesByTemplate: async (templateId: string): Promise<FormResponse[]> => {
    try {
      const response = await apiClient.get<FormResponse[]>(`/form-responses/template/${templateId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting responses for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new form response
   * @param data - The form response data
   * @returns Promise with created form response
   */
  createResponse: async (data: FormResponseCreateData): Promise<FormResponse> => {
    try {
      const response = await apiClient.post<FormResponse>('/form-responses', data);
      return response.data;
    } catch (error) {
      console.error('Error creating form response:', error);
      throw error;
    }
  },

  /**
   * Get form responses for the current user
   * @returns Promise with array of form responses
   */
  getUserResponses: async (): Promise<FormResponse[]> => {
    try {
      const response = await apiClient.get<FormResponse[]>('/form-responses/user');
      return response.data;
    } catch (error) {
      console.error('Error getting user responses:', error);
      throw error;
    }
  },

  /**
   * Get aggregate data for a specific template
   * @param templateId - The ID of the template
   * @returns Promise with aggregate data
   */
  getAggregateData: async (templateId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/form-responses/aggregate/${templateId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting aggregate data for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Export responses for a template as CSV
   * @param templateId - The ID of the template
   * @returns Promise with CSV data as a string
   */
  exportResponsesAsCsv: async (templateId: string): Promise<string> => {
    try {
      const response = await apiClient.get(`/form-responses/template/${templateId}/export`, {
        responseType: 'blob'
      });
      
      // Convert blob to string
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(response.data);
      });
    } catch (error) {
      console.error(`Error exporting responses for template ${templateId}:`, error);
      throw error;
    }
  }
};

export default formResponseService;
