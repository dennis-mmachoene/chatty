// ============================================
// FILE: server/src/middleware/upload.middleware.js
// ============================================
const multer = require('multer');
const path = require('path');
const { ValidationError } = require('../utils/errors');
const { FILE_SIZE_LIMITS, MIME_TYPES } = require('../config/constants');
const logger = require('../utils/logger');

// Memory storage for processing
const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        ),
        false
      );
    }
  };
};

const createUploadMiddleware = (options = {}) => {
  const {
    maxSize = FILE_SIZE_LIMITS.FILE,
    allowedTypes = null,
    fieldName = 'file',
  } = options;

  const multerConfig = {
    storage,
    limits: {
      fileSize: maxSize,
    },
  };

  if (allowedTypes) {
    multerConfig.fileFilter = fileFilter(allowedTypes);
  }

  const upload = multer(multerConfig);

  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new ValidationError(
              `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
            )
          );
        }
        return next(new ValidationError(err.message));
      }
      
      if (err) {
        return next(err);
      }

      // Log upload
      if (req.file) {
        logger.info(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
      }

      next();
    });
  };
};

// Specific upload middleware
const uploadImage = createUploadMiddleware({
  maxSize: FILE_SIZE_LIMITS.IMAGE,
  allowedTypes: MIME_TYPES.IMAGES,
  fieldName: 'image',
});

const uploadVideo = createUploadMiddleware({
  maxSize: FILE_SIZE_LIMITS.VIDEO,
  allowedTypes: MIME_TYPES.VIDEOS,
  fieldName: 'video',
});

const uploadAudio = createUploadMiddleware({
  maxSize: FILE_SIZE_LIMITS.AUDIO,
  allowedTypes: MIME_TYPES.AUDIO,
  fieldName: 'audio',
});

const uploadFile = createUploadMiddleware({
  maxSize: FILE_SIZE_LIMITS.FILE,
  fieldName: 'file',
});

module.exports = {
  createUploadMiddleware,
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadFile,
};