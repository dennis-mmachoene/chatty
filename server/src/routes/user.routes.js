// ============================================
// FILE: server/src/routes/user.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateBody, validateQuery } = require('../middleware/validation.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const { z } = require('zod');

// Validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  statusMessage: z.string().max(200).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
});

const searchUsersSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
});

const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  showLastSeen: z.boolean().optional(),
  showProfilePhoto: z.enum(['everyone', 'contacts', 'nobody']).optional(),
  showStatus: z.enum(['everyone', 'contacts', 'nobody']).optional(),
});

// Routes
router.get('/profile', authenticate, userController.getProfile);
router.get('/search', authenticate, validateQuery(searchUsersSchema), userController.searchUsers);
router.get('/settings', authenticate, userController.getSettings);
router.get('/qr-code', authenticate, userController.generateQRCode);
router.get('/:userId', authenticate, userController.getUserById);

router.put('/profile', authenticate, validateBody(updateProfileSchema), userController.updateProfile);
router.put('/settings', authenticate, validateBody(updateSettingsSchema), userController.updateSettings);

router.post('/avatar', authenticate, uploadImage, userController.uploadAvatar);

router.delete('/account', authenticate, userController.deleteAccount);

router.get('/data/export', authenticate, userController.exportData);

module.exports = router;