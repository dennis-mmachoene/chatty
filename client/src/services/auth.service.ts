// ============================================
// FILE: src/services/auth.service.ts
// Authentication service
// ============================================

import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { User } from '@/types/user.types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RequestOTPPayload {
  email: string;
}

export interface VerifyOTPPayload {
  email: string;
  code: string;
}

class AuthService {
  async requestOTP(payload: RequestOTPPayload): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/request-otp', payload);
    return response.data;
  }

  async verifyOTP(payload: VerifyOTPPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', payload);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout', {
      refreshToken,
    });
    return response.data;
  }

  async logoutAll(): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout-all');
    return response.data;
  }
}

export const authService = new AuthService();