import apiClient from './api-client';
import { FormResponse } from '@/types';

export interface FormResponseCreateData {
  templateId: string;
  answers: {
    [key: string]: string | number | boolean;
  };
}

export interface FormResponseFilters {
  templateId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AggregateData {
  total_responses: number;
  avg_custom_int1: number | null;
  avg_custom_int2: number | null;
  avg_custom_int3: number | null;
  avg_custom_int4: number | null;
  string1_count: number;
  string2_count: number;
  string3_count: number;
  string4_count: number;
  text1_count: number;
  text2_count: number;
  text3_count: number;
  text4_count: number;
  checkbox1_yes_count: number;
  checkbox2_yes_count: number;
  checkbox3_yes_count: number;
  checkbox4_yes_count: number;
}

/**
 * Service to handle form response operations
 */
export const formResponseService = {
  // Create a new form response
  createResponse: async (data: FormResponseCreateData): Promise<FormResponse> => {
    try {
      return await apiClient.post<FormResponse>('/form-responses', data);
    } catch (error) {
      console.error('Error creating form response:', error);
      throw error;
    }
  },

  // Get responses for a specific form template
  getResponsesByTemplate: async (templateId: string): Promise<FormResponse[]> => {
    try {
      return await apiClient.get<FormResponse[]>(`/form-responses/template/${templateId}`);
    } catch (error) {
      console.error('Error fetching form responses by template:', error);
      throw error;
    }
  },

  // Get a specific form response by ID
  getResponseById: async (id: string): Promise<FormResponse> => {
    try {
      return await apiClient.get<FormResponse>(`/form-responses/${id}`);
    } catch (error) {
      console.error('Error fetching form response:', error);
      throw error;
    }
  },

  // Get responses submitted by the current user
  getUserResponses: async (): Promise<FormResponse[]> => {
    try {
      return await apiClient.get<FormResponse[]>('/form-responses/user');
    } catch (error) {
      console.error('Error fetching user form responses:', error);
      throw error;
    }
  },

  // Get responses by user ID (admin only)
  getResponsesByUser: async (userId: string): Promise<FormResponse[]> => {
    try {
      return await apiClient.get<FormResponse[]>(`/form-responses/user/${userId}`);
    } catch (error) {
      console.error('Error fetching form responses by user:', error);
      throw error;
    }
  },

  // Get aggregate data for a template
  getAggregateData: async (templateId: string): Promise<AggregateData> => {
    try {
      return await apiClient.get<AggregateData>(`/form-responses/template/${templateId}/aggregate`);
    } catch (error) {
      console.error('Error fetching aggregate data:', error);
      throw error;
    }
  },

  // Filter and search through form responses (admin feature)
  searchResponses: async (filters: FormResponseFilters): Promise<FormResponse[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.templateId) queryParams.append('templateId', filters.templateId);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      return await apiClient.get<FormResponse[]>(`/form-responses/search?${queryString}`);
    } catch (error) {
      console.error('Error searching form responses:', error);
      throw error;
    }
  },

  // Export responses as CSV (for data analysis)
  exportResponsesAsCsv: async (templateId: string): Promise<Blob> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/form-responses/template/${templateId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export responses');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting responses as CSV:', error);
      throw error;
    }
  }
};

export default formResponseService;
