// ============================================
// FILE: src/services/user.service.ts
// User management service
// ============================================

import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { User, UserSettings, Contact } from '@/types/user.types';

export interface UpdateProfilePayload {
  displayName?: string;
  statusMessage?: string;
  phone?: string;
}

export interface UpdateSettingsPayload extends Partial<Omit<UserSettings, 'userId'>> {}

class UserService {
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile');
    return response.data;
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', payload);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async searchUsers(query: string): Promise<ApiResponse<Contact[]>> {
    const response = await apiClient.get<ApiResponse<Contact[]>>('/users/search', {
      params: { q: query },
    });
    return response.data;
  }

  async getSettings(): Promise<ApiResponse<UserSettings>> {
    const response = await apiClient.get<ApiResponse<UserSettings>>('/users/settings');
    return response.data;
  }

  async updateSettings(payload: UpdateSettingsPayload): Promise<ApiResponse<UserSettings>> {
    const response = await apiClient.put<ApiResponse<UserSettings>>('/users/settings', payload);
    return response.data;
  }

  async generateQRCode(): Promise<ApiResponse<{ qrCode: string }>> {
    const response = await apiClient.get<ApiResponse<{ qrCode: string }>>('/users/qr-code');
    return response.data;
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>('/users/account');
    return response.data;
  }

  async exportData(): Promise<ApiResponse<unknown>> {
    const response = await apiClient.get<ApiResponse<unknown>>('/users/data/export');
    return response.data;
  }
}

export const userService = new UserService();