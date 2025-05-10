import apiClient from './api-client';

export interface FormResponseData {
  id: string;
  userId: string;
  templateId: string;
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
  template?: {
    id: string;
    title: string;
    questionOrder: string;
    customString1Question?: string;
    customString2Question?: string;
    customString3Question?: string;
    customString4Question?: string;
    customText1Question?: string;
    customText2Question?: string;
    customText3Question?: string;
    customText4Question?: string;
    customInt1Question?: number;
    customInt2Question?: number;
    customInt3Question?: number;
    customInt4Question?: number;
    customCheckbox1Question?: string;
    customCheckbox2Question?: string;
    customCheckbox3Question?: string;
    customCheckbox4Question?: string;
    customString1State?: boolean;
    customString2State?: boolean;
    customString3State?: boolean;
    customString4State?: boolean;
    customText1State?: boolean;
    customText2State?: boolean;
    customText3State?: boolean;
    customText4State?: boolean;
    customInt1State?: boolean;
    customInt2State?: boolean;
    customInt3State?: boolean;
    customInt4State?: boolean;
    customCheckbox1State?: boolean;
    customCheckbox2State?: boolean;
    customCheckbox3State?: boolean;
    customCheckbox4State?: boolean;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const formResponseService = {
  // Get all responses for a template
  async getResponsesByTemplateId(templateId: string): Promise<FormResponseData[]> {
    const response = await apiClient.get(`/responses/template/${templateId}`);
    return response.data;
  },
  
  // Get a specific response by ID
  async getResponseById(id: string): Promise<FormResponseData> {
    const response = await apiClient.get(`/responses/${id}`);
    return response.data;
  },
  
  // Get current user's responses
  async getUserResponses(): Promise<FormResponseData[]> {
    const response = await apiClient.get('/responses/user');
    return response.data;
  },
  
  // Submit a form response
  async submitResponse(data: Partial<FormResponseData>): Promise<FormResponseData> {
    const response = await apiClient.post('/responses', data);
    return response.data;
  },
  
  // Get aggregate data for a template
  async getAggregateData(templateId: string): Promise<any> {
    const response = await apiClient.get(`/responses/aggregate/${templateId}`);
    return response.data;
  },
  
  // Delete a response
  async deleteResponse(id: string): Promise<void> {
    await apiClient.delete(`/responses/${id}`);
  }
};
