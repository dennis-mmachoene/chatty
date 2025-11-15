module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Message Types
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    FILE: 'file',
    LOCATION: 'location',
    VOICE_NOTE: 'voice_note',
  },

  // Message Status
  MESSAGE_STATUS: {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
  },

  // Conversation Types
  CONVERSATION_TYPES: {
    DIRECT: 'direct',
    GROUP: 'group',
  },

  // Contact Status
  CONTACT_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    BLOCKED: 'blocked',
  },

  // Call Types
  CALL_TYPES: {
    AUDIO: 'audio',
    VIDEO: 'video',
  },

  // Call Status
  CALL_STATUS: {
    MISSED: 'missed',
    COMPLETED: 'completed',
    DECLINED: 'declined',
    FAILED: 'failed',
  },

  // Status Types
  STATUS_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MEMBER: 'member',
  },

  // Theme Options
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },

  // Privacy Settings
  PRIVACY_OPTIONS: {
    EVERYONE: 'everyone',
    CONTACTS: 'contacts',
    NOBODY: 'nobody',
  },

  // WebSocket Events
  WS_EVENTS: {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    MESSAGE_SENT: 'message:sent',
    MESSAGE_DELIVERED: 'message:delivered',
    MESSAGE_READ: 'message:read',
    MESSAGE_DELETED: 'message:deleted',
    MESSAGE_EDITED: 'message:edited',
    MESSAGE_REACTION: 'message:reaction',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    PRESENCE_UPDATE: 'presence:update',
    CALL_OFFER: 'call:offer',
    CALL_ANSWER: 'call:answer',
    CALL_CANDIDATE: 'call:candidate',
    CALL_END: 'call:end',
    STATUS_POSTED: 'status:posted',
    STATUS_VIEWED: 'status:viewed',
    CONTACT_REQUEST: 'contact:request',
    CONTACT_ACCEPTED: 'contact:accepted',
  },

  // File Size Limits (bytes)
  FILE_SIZE_LIMITS: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
    AUDIO: 10 * 1024 * 1024, // 10MB
    FILE: 50 * 1024 * 1024, // 50MB
  },

  // Media MIME Types
  MIME_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // OTP Configuration
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 3,
    RATE_LIMIT_WINDOW: 60 * 60 * 1000, // 1 hour
    RATE_LIMIT_MAX: 3,
  },

  // Token Configuration
  TOKEN: {
    ACCESS_EXPIRY: '15m',
    REFRESH_EXPIRY: '7d',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
  },

  // Cache TTL (seconds)
  CACHE_TTL: {
    USER_PROFILE: 300, // 5 minutes
    CONVERSATION: 180, // 3 minutes
    PRESENCE: 60, // 1 minute
  },

  // Rate Limiting
  RATE_LIMITS: {
    GLOBAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX: 100,
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000,
      MAX: 5,
    },
    UPLOAD: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX: 10,
    },
  },

  // Error Codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    INVALID_OTP: 'INVALID_OTP',
    EXPIRED_OTP: 'EXPIRED_OTP',
    INVALID_TOKEN: 'INVALID_TOKEN',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  },

  // Regex Patterns
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    PHONE: /^\+?[1-9]\d{1,14}$/,
  },
};