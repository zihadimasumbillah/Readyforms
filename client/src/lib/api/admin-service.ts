import apiClient from './api-client';
import { Template, User, Topic, FormResponse } from '@/types';

// Define SystemActivity type that's missing
export interface SystemActivity {
  id: string;
  type: string;
  action: string;
  timestamp: string;
  user?: string;
  title?: string;
  details?: string;
}

export const adminService = {
  // User management
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/admin/users');
    return response.data;
  },

  async toggleUserBlock(userId: string): Promise<User> {
    const response = await apiClient.put<{ user: User }>(`/admin/users/${userId}/block`);
    return response.data.user;  // Return only the user object, not the wrapper
  },

  async toggleUserAdmin(userId: string): Promise<User> {
    const response = await apiClient.put<{ user: User }>(`/admin/users/${userId}/admin`);
    return response.data.user;  // Return only the user object, not the wrapper
  },
  
  // Template management
  async getAllTemplates(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>('/admin/templates');
    return response.data;
  },
  
  async getTopTemplates(limit: number = 5): Promise<Template[]> {
    const response = await apiClient.get<Template[]>(`/admin/templates/top?limit=${limit}`);
    return response.data;
  },

  async getTemplateById(id: string): Promise<Template> {
    const response = await apiClient.get<Template>(`/admin/templates/${id}`);
    return response.data;
  },

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    const response = await apiClient.put<Template>(`/admin/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<Template> {
    const response = await apiClient.delete<Template>(`/admin/templates/${id}`);
    return response.data;
  },
  
  // Analytics
  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
  
  // Form Responses
  async getAllFormResponses(): Promise<FormResponse[]> {
    const response = await apiClient.get<FormResponse[]>('/admin/responses');
    return response.data;
  },
  
  // Admin User Management
  async getAllAdminUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/admin/users');
    return response.data;
  },
  
  // Topics Management
  async getAllTopics(): Promise<Topic[]> {
    const response = await apiClient.get<Topic[]>('/admin/topics');
    return response.data;
  },
  
  async createTopic(name: string, description?: string): Promise<Topic> {
    const response = await apiClient.post<Topic>('/admin/topics', { name, description });
    return response.data;
  },
  
  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    const response = await apiClient.put<Topic>(`/admin/topics/${id}`, data);
    return response.data;
  },
  
  // System Activity
  async getSystemActivity(limit: number = 20): Promise<SystemActivity[]> {
    const response = await apiClient.get<SystemActivity[]>(`/admin/activity?limit=${limit}`);
    return response.data;
  },
  
  // Dashboard data
  async getRecentTemplates(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>('/admin/templates/recent');
    return response.data;
  },
  
  async getRecentResponses(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>('/admin/responses/recent');
    return response.data;
  }
};

export default adminService;