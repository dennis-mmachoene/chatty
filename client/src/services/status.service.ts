// ============================================
// FILE: src/services/status.service.ts
// Status/Stories service
// ============================================

import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { Status, UserStatuses, StatusView } from '@/types/status.types';

export interface CreateStatusPayload {
  type: Status['type'];
  content?: string;
  mediaUrl?: string;
  backgroundColor?: string;
}

class StatusService {
  async getMyStatuses(): Promise<ApiResponse<Status[]>> {
    const response = await apiClient.get<ApiResponse<Status[]>>('/statuses/my');
    return response.data;
  }

  async getContactStatuses(): Promise<ApiResponse<UserStatuses[]>> {
    const response = await apiClient.get<ApiResponse<UserStatuses[]>>('/statuses/contacts');
    return response.data;
  }

  async createStatus(payload: CreateStatusPayload): Promise<ApiResponse<Status>> {
    const response = await apiClient.post<ApiResponse<Status>>('/statuses', payload);
    return response.data;
  }

  async viewStatus(statusId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/statuses/${statusId}/view`);
    return response.data;
  }

  async deleteStatus(statusId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/statuses/${statusId}`);
    return response.data;
  }

  async getViewers(statusId: string): Promise<ApiResponse<StatusView[]>> {
    const response = await apiClient.get<ApiResponse<StatusView[]>>(
      `/statuses/${statusId}/viewers`
    );
    return response.data;
  }
}

export const statusService = new StatusService();