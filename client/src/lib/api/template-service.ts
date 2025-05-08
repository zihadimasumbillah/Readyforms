import apiClient from './api-client';
import { Template } from '@/types';

class TemplateService {
  async getAllTemplates() {
    const response = await apiClient.get<Template[]>('/templates');
    return response.data;
  }

  async getTemplateById(id: string) {
    const response = await apiClient.get<Template>(`/templates/${id}`);
    return response.data;
  }

  async createTemplate(templateData: Partial<Template>) {
    const response = await apiClient.post<Template>('/templates', templateData);
    return response.data;
  }

  async updateTemplate(id: string, templateData: Partial<Template> & { version: number }) {
    const response = await apiClient.put<Template>(`/templates/${id}`, templateData);
    return response.data;
  }

  async deleteTemplate(id: string, version: number) {
    const response = await apiClient.delete(`/templates/${id}`, {
      data: { version }
    });
    return response.data;
  }

  async searchTemplates(query: string) {
    const response = await apiClient.get<Template[]>(`/templates/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
}

// Create and export service instance
const templateService = new TemplateService();

// Export both the class and the instance
export { TemplateService, templateService };
export default templateService;