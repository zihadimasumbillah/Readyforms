import apiClient from './api-client';

// Add the FormResponseData interface
export interface FormResponseData {
  id: string;
  templateId: string;
  userId: string;
  customString1Answer?: string;
  customString2Answer?: string;
  customString3Answer?: string;
  customString4Answer?: string;
  customText1Answer?: string;
  customText2Answer?: string;
  customText3Answer?: string;
  customText4Answer?: string;
  customInt1Answer?: number;
  customInt2Answer?: number;
  customInt3Answer?: number;
  customInt4Answer?: number;
  customCheckbox1Answer?: boolean;
  customCheckbox2Answer?: boolean;
  customCheckbox3Answer?: boolean;
  customCheckbox4Answer?: boolean;
  score?: number;
  totalPossiblePoints?: number;
  scoreViewed?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Create and export the form response service
export const formResponseService = {
  /**
   * Get all responses for a template
   */
  async getResponsesByTemplate(templateId: string): Promise<FormResponseData[]> {
    try {
      const response = await apiClient.get(`/responses/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch responses:', error);
      throw error;
    }
  },

  /**
   * Get response by ID
   */
  async getResponseById(id: string): Promise<FormResponseData> {
    try {
      const response = await apiClient.get(`/responses/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch response ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new form response
   */
  async createResponse(responseData: any, templateId: string): Promise<FormResponseData> {
    try {
      const response = await apiClient.post('/responses', {
        ...responseData,
        templateId
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create response:', error);
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
      console.error('Failed to fetch aggregate data:', error);
      throw error;
    }
  },

  /**
   * Get responses for current user
   */
  async getUserResponses(): Promise<FormResponseData[]> {
    try {
      const response = await apiClient.get('/responses/user');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user responses:', error);
      throw error;
    }
  }
};

export default formResponseService;
