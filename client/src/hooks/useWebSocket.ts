// ============================================
// FILE: src/hooks/useWebSocket.ts
// WebSocket connection hook
// ============================================

import { useEffect, useCallback } from 'react';
import { websocketService, WebSocketEvent } from '@/services/websocket.service';
import { any } from 'zod';

export const useWebSocket = <T = unknown>(
  event: WebSocketEvent | string,
  callback: (data: T) => void
) => {
  useEffect(() => {
    websocketService.on<T>(event, callback);

    return () => {
      websocketService.off(event, callback);
    };
  }, [event, callback]);

  const emit = useCallback(
    <D = unknown>(emitEvent: WebSocketEvent | string, data?: D) => {
      websocketService.emit(emitEvent, data);
    },
    []
  );

  return { emit };
};