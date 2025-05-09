import apiClient from './api-client';
import { FormResponse } from '@/types';

export const formResponseService = {
  /**
   * Submit a form response
   */
  async submitResponse(responseData: any): Promise<FormResponse> {
    try {
      const response = await apiClient.post('/responses', responseData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit form response:', error);
      throw error;
    }
  },

  /**
   * Get responses for a template
   */
  async getResponsesByTemplate(templateId: string): Promise<FormResponse[]> {
    try {
      const response = await apiClient.get(`/responses/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch responses for template ${templateId}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific response by ID
   */
  async getResponseById(responseId: string): Promise<FormResponse> {
    try {
      const response = await apiClient.get(`/responses/${responseId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch response ${responseId}:`, error);
      throw error;
    }
  },

  /**
   * Get responses for the current user
   */
  async getUserResponses(): Promise<FormResponse[]> {
    try {
      const response = await apiClient.get('/responses/user');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user responses:', error);
      throw error;
    }
  },

  /**
   * Get aggregate data for a template
   */
  async getAggregateData(templateId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/responses/aggregate/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch aggregate data for template ${templateId}:`, error);
      throw error;
    }
  }
};

export default formResponseService;
