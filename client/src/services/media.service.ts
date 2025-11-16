// ============================================
// FILE: src/services/media.service.ts
// Media upload service
// ============================================

import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';

export interface MediaUploadResponse {
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  duration?: number;
}

class MediaService {
  async uploadImage(file: File): Promise<ApiResponse<MediaUploadResponse>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<MediaUploadResponse>>(
      '/media/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async uploadVideo(file: File): Promise<ApiResponse<MediaUploadResponse>> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await apiClient.post<ApiResponse<MediaUploadResponse>>(
      '/media/videos',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async uploadAudio(file: File): Promise<ApiResponse<MediaUploadResponse>> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await apiClient.post<ApiResponse<MediaUploadResponse>>(
      '/media/audio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const mediaService = new MediaService();