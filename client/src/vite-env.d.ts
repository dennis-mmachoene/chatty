// ============================================
// FILE: src/vite-env.d.ts
// Vite environment type definitions
// ============================================

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_ENV: string;
  readonly VITE_ENABLE_VOICE_CALLS: string;
  readonly VITE_ENABLE_VIDEO_CALLS: string;
  readonly VITE_ENABLE_STATUSES: string;
  readonly VITE_MAX_IMAGE_SIZE: string;
  readonly VITE_MAX_VIDEO_SIZE: string;
  readonly VITE_MAX_AUDIO_SIZE: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DESCRIPTION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}