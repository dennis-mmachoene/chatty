// ============================================
// FILE: server/src/routes/call.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const callController = require('../controllers/call.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateParams, validateQuery } = require('../middleware/validation.middleware');
const { z } = require('zod');

// Validation schemas
const callHistoryQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  cursor: z.string().optional(),
});

const callIdSchema = z.object({
  callId: z.string().uuid('Invalid call ID'),
});

// Routes
router.get('/ice-servers', authenticate, callController.getIceServers);
router.get('/history', authenticate, validateQuery(callHistoryQuerySchema), callController.getCallHistory);
router.get('/statistics', authenticate, callController.getCallStatistics);

router.delete('/history/:callId', authenticate, validateParams(callIdSchema), callController.deleteCallHistory);

module.exports = router;