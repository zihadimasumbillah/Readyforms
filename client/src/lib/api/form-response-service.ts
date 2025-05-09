import apiClient from './api-client';

export interface FormResponseSubmission {
  templateId: string;
  answers: Record<string, any>;
}

export interface FormResponseData {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
  percentScore?: number;
  template?: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface FormResponseAggregateData {
  avg_custom_int1: number | null;
  avg_custom_int2: number | null;
  avg_custom_int3: number | null;
  avg_custom_int4: number | null;
  total_responses: number;
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
  avg_score: number;
  max_score: number;
  min_score: number;
  avg_total_points: number;
}

export const formResponseService = {
  /**
   * Submit a form response
   * @param formResponseData The form response data
   */
  async submitResponse(formResponseData: FormResponseSubmission): Promise<FormResponseData> {
    try {
      const response = await apiClient.post<FormResponseData>('/form-responses', formResponseData);
      return response.data;
    } catch (error: any) {
      console.error('Error submitting form response:', error);
      
      // Special handling for authentication errors
      if (error.response?.data?.requiresAuth) {
        throw { ...error.response.data, requiresAuth: true };
      }
      
      throw error.response?.data || { message: 'Failed to submit form response' };
    }
  },
  
  /**
   * Get all responses for the current user
   */
  async getUserResponses(): Promise<FormResponseData[]> {
    try {
      const response = await apiClient.get<FormResponseData[]>('/form-responses/user');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user responses:', error);
      throw error.response?.data || { message: 'Failed to fetch responses' };
    }
  },
  
  /**
   * Get a specific form response by ID
   * @param id The response ID
   */
  async getResponseById(id: string): Promise<FormResponseData> {
    try {
      const response = await apiClient.get<FormResponseData>(`/form-responses/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching response:', error);
      throw error.response?.data || { message: 'Failed to fetch response' };
    }
  },
  
  /**
   * Get all form responses for a template
   * @param templateId The template ID
   */
  async getResponsesByTemplate(templateId: string): Promise<FormResponseData[]> {
    try {
      const response = await apiClient.get<FormResponseData[]>(`/form-responses/template/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching template responses:', error);
      throw error.response?.data || { message: 'Failed to fetch template responses' };
    }
  },
  
  /**
   * Get aggregate data for a template's responses
   * @param templateId The template ID
   */
  async getResponseAggregates(templateId: string): Promise<FormResponseAggregateData> {
    try {
      const response = await apiClient.get<FormResponseAggregateData>(`/form-responses/aggregate/${templateId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching response aggregates:', error);
      throw error.response?.data || { message: 'Failed to fetch response statistics' };
    }
  }
};

export default formResponseService;
