import axios from 'axios';

// Define the API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create an axios instance for API calls
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface FormResponse {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  score?: number;
  totalPossiblePoints?: number;
  scoreViewed?: boolean;
  // Add other form response fields as needed
}

export interface FormResponseDetail extends FormResponse {
  template: {
    id: string;
    title: string;
    [key: string]: any; // Add index signature for dynamic template properties
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  [key: string]: any; // Add index signature for dynamic response properties
}

export interface AggregateData {
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

export interface FormResponseFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

const responseService = {
  // Submit a form response
  submitResponse: async (templateId: string, answers: Record<string, any>): Promise<FormResponse | undefined> => {
    try {
      const response = await apiClient.post<FormResponse>('/form-responses', {
        templateId,
        answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting form response:', error);
      return undefined;
    }
  },

  getResponsesByTemplate: async (templateId: string): Promise<FormResponse[]> => {
    try {
      const response = await apiClient.get<FormResponse[]>(`/form-responses/template/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching responses by template:', error);
      return [];
    }
  },

  getResponseById: async (id: string): Promise<FormResponseDetail | null> => {
    try {
      const response = await apiClient.get<FormResponseDetail>(`/form-responses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching response by ID:', error);
      return null;
    }
  },
  
  getAggregateData: async (templateId: string): Promise<AggregateData | null> => {
    try {
      const response = await apiClient.get<AggregateData>(`/form-responses/aggregate/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching aggregate data:', error);
      return null;
    }
  },
  
  deleteResponse: async (responseId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/form-responses/${responseId}`);
      return true;
    } catch (error) {
      console.error('Error deleting response:', error);
      return false;
    }
  }
};

export default responseService;
