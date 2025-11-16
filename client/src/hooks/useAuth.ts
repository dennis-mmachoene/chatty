// ============================================
// FILE: src/hooks/useAuth.ts
// Authentication hook
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { websocketService } from '@/services/websocket.service';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS, QUERY_KEYS, ROUTES } from '@/utils/constants';
import type { User } from '@/types/user.types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: async () => {
      const token = storage.get<string>(STORAGE_KEYS.TOKEN, '');
      if (!token) return null;

      const response = await userService.getProfile();
      if (response.success && response.data) {
        storage.set(STORAGE_KEYS.USER, response.data);
        return response.data;
      }
      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Request OTP
  const requestOTPMutation = useMutation({
    mutationFn: authService.requestOTP,
    onSuccess: () => {
      toast.success('OTP sent to your email');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send OTP');
    },
  });

  // Verify OTP and login
  const verifyOTPMutation = useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        storage.set(STORAGE_KEYS.TOKEN, accessToken);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        storage.set(STORAGE_KEYS.USER, user);

        queryClient.setQueryData([QUERY_KEYS.USER], user);

        // Connect WebSocket
        websocketService.connect();

        toast.success('Welcome back!');
        navigate(ROUTES.DASHBOARD);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid OTP');
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN, '');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onSuccess: () => {
      // Clear storage
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);

      // Clear query cache
      queryClient.clear();

      // Disconnect WebSocket
      websocketService.disconnect();

      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      // Force logout even on error
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      queryClient.clear();
      websocketService.disconnect();
      navigate(ROUTES.LOGIN);
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    requestOTP: requestOTPMutation.mutate,
    verifyOTP: verifyOTPMutation.mutate,
    logout: logoutMutation.mutate,
    isRequestingOTP: requestOTPMutation.isPending,
    isVerifyingOTP: verifyOTPMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};