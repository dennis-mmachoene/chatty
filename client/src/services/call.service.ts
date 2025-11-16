// ============================================
// FILE: src/services/call.service.ts
// Voice and video call service
// ============================================

import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { CallWithUser, IceServer } from '@/types/call.types';

class CallService {
  async getIceServers(): Promise<ApiResponse<{ iceServers: IceServer[] }>> {
    const response = await apiClient.get<ApiResponse<{ iceServers: IceServer[] }>>(
      '/calls/ice-servers'
    );
    return response.data;
  }

  async getCallHistory(
    limit = 50,
    cursor?: string
  ): Promise<ApiResponse<CallWithUser[]>> {
    const response = await apiClient.get<ApiResponse<CallWithUser[]>>('/calls/history', {
      params: { limit, cursor },
    });
    return response.data;
  }

  async deleteCallHistory(callId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/calls/history/${callId}`);
    return response.data;
  }

  async getCallStatistics(): Promise<ApiResponse<{
    total: number;
    audio: number;
    video: number;
    completed: number;
    missed: number;
    totalDuration: number;
  }>> {
    const response = await apiClient.get('/calls/statistics');
    return response.data;
  }
}

export const callService = new CallService();