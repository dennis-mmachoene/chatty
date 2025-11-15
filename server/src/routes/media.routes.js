// ============================================
// FILE: server/src/routes/media.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadImage, uploadVideo, uploadAudio } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/ratelimit.middleware');

// Routes
router.post('/images', authenticate, uploadLimiter, uploadImage, mediaController.uploadImage);
router.post('/videos', authenticate, uploadLimiter, uploadVideo, mediaController.uploadVideo);
router.post('/audio', authenticate, uploadLimiter, uploadAudio, mediaController.uploadAudio);

module.exports = router;