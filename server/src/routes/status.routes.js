// ============================================
// FILE: server/src/routes/status.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validation.middleware');
const { z } = require('zod');

// Validation schemas
const createStatusSchema = z.object({
  type: z.enum(['text', 'image', 'video']),
  content: z.string().max(500).optional(),
  mediaUrl: z.string().url().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const statusIdSchema = z.object({
  statusId: z.string().uuid('Invalid status ID'),
});

// Routes
router.get('/my', authenticate, statusController.getMyStatuses);
router.get('/contacts', authenticate, statusController.getContactStatuses);
router.get('/:statusId/viewers', authenticate, validateParams(statusIdSchema), statusController.getViewers);

router.post('/', authenticate, validateBody(createStatusSchema), statusController.createStatus);
router.post('/:statusId/view', authenticate, validateParams(statusIdSchema), statusController.viewStatus);

router.delete('/:statusId', authenticate, validateParams(statusIdSchema), statusController.deleteStatus);

module.exports = router;