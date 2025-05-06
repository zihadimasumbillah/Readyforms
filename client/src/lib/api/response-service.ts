import apiClient from './api-client';

export interface FormResponse {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For dynamic form fields
}

// Add this new interface for detailed form response that includes related data
export interface FormResponseDetail extends FormResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  template: {
    id: string;
    title: string;
    [key: string]: any; // Allow dynamic access to template fields
  };
}

export interface AggregateData {
  avg_custom_int1: number | null;
  avg_custom_int2: number | null;
  avg_custom_int3: number | null;
  avg_custom_int4: number | null;
  checkbox1_yes_count: number;
  checkbox2_yes_count: number;
  checkbox3_yes_count: number;
  checkbox4_yes_count: number;
  total_responses: number;
  string1_count: number;
  string2_count: number;
  string3_count: number;
  string4_count: number;
  text1_count: number;
  text2_count: number;
  text3_count: number;
  text4_count: number;
}

export interface FormResponseFilters {
  templateId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

const responseService = {
  // Submit a form response
  submitResponse: async (templateId: string, answers: Record<string, any>): Promise<FormResponse> => {
    try {
      const response = await apiClient.post<FormResponse>('/forms', {
        templateId,
        answers
      });
      return response;
    } catch (error) {
      console.error('Error submitting form response:', error);
      throw error;
    }
  },
  
  // Get all form responses for a template
  getResponsesByTemplate: async (templateId: string): Promise<FormResponse[]> => {
    try {
      const response = await apiClient.get<FormResponse[]>(`/forms/template/${templateId}`);
      return response;
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw error;
    }
  },
  
  // Get a form response by ID - update the return type to FormResponseDetail
  getResponseById: async (id: string): Promise<FormResponseDetail> => {
    try {
      const response = await apiClient.get<FormResponseDetail>(`/forms/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching form response:', error);
      throw error;
    }
  },

  // Get aggregate data for responses to a template
  getAggregateData: async (templateId: string): Promise<AggregateData> => {
    try {
      const response = await apiClient.get<AggregateData>(`/forms/template/${templateId}/aggregate`);
      return response;
    } catch (error) {
      console.error('Error fetching aggregate data:', error);
      throw error;
    }
  },

  // Delete a response
  deleteResponse: async (responseId: string): Promise<void> => {
    try {
      await apiClient.delete(`/forms/${responseId}`);
    } catch (error) {
      console.error('Error deleting form response:', error);
      throw error;
    }
  }
};

// Export both as default and named export
export { responseService };
export default responseService;
