import apiClient from './api-client';

export interface GeneratedQuestion {
  type: 'string' | 'text' | 'int' | 'checkbox';
  question: string;
  isActive: boolean;
}

export interface GeneratedFormData {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
  isQuiz?: boolean;
}

export const aiService = {
  async generateForm(prompt: string): Promise<GeneratedFormData> {
    const response = await apiClient.post<GeneratedFormData>('/ai/generate-form', { prompt });
    return response.data;
  },

  async improveForm(formData: GeneratedFormData, instructions?: string): Promise<GeneratedFormData> {
    const response = await apiClient.post<GeneratedFormData>('/ai/improve-form', { formData, instructions });
    return response.data;
  },
};

export default aiService;
