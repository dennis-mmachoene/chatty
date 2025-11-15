// ============================================
// FILE: server/src/routes/contact.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validation.middleware');
const { z } = require('zod');

// Validation schemas
const sendRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const contactIdSchema = z.object({
  contactId: z.string().uuid('Invalid contact ID'),
});

const addByQRSchema = z.object({
  qrData: z.string().min(1, 'QR data is required'),
});

// Routes
router.get('/', authenticate, contactController.getContacts);
router.get('/pending', authenticate, contactController.getPendingRequests);

router.post('/request', authenticate, validateBody(sendRequestSchema), contactController.sendRequest);
router.post('/qr', authenticate, validateBody(addByQRSchema), contactController.addContactByQR);

router.put('/:contactId/accept', authenticate, validateParams(contactIdSchema), contactController.acceptRequest);
router.put('/:contactId/block', authenticate, validateParams(contactIdSchema), contactController.blockContact);

router.delete('/:contactId', authenticate, validateParams(contactIdSchema), contactController.deleteContact);

module.exports = router;