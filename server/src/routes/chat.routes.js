// ============================================
// FILE: server/src/routes/chat.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkConversationAccess } = require('../middleware/conversation.middleware');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation.middleware');
const { z } = require('zod');

// Validation schemas
const conversationsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  cursor: z.string().optional(),
});

const createDirectConversationSchema = z.object({
  contactId: z.string().uuid('Invalid contact ID'),
});

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  participantIds: z.array(z.string().uuid()).min(1, 'At least one participant required'),
});

const conversationIdSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
});

const messageIdSchema = z.object({
  messageId: z.string().uuid('Invalid message ID'),
});

const sendMessageSchema = z.object({
  type: z.enum(['text', 'image', 'video', 'audio', 'file', 'location', 'voice_note']),
  content: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  duration: z.number().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  replyTo: z.string().uuid().optional(),
});

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

const editMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

const messagesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  cursor: z.string().optional(),
});

const searchQuerySchema = z.object({
  q: z.string().min(2),
});

// Routes
router.get('/conversations', authenticate, validateQuery(conversationsQuerySchema), chatController.getConversations);

router.post('/conversations/direct', authenticate, validateBody(createDirectConversationSchema), chatController.getOrCreateDirectConversation);
router.post('/conversations/group', authenticate, validateBody(createGroupSchema), chatController.createGroupConversation);

router.get('/conversations/:conversationId/messages', authenticate, validateParams(conversationIdSchema), validateQuery(messagesQuerySchema), checkConversationAccess, chatController.getMessages);

router.post('/conversations/:conversationId/messages', authenticate, validateParams(conversationIdSchema), validateBody(sendMessageSchema), checkConversationAccess, chatController.sendMessage);

router.post('/messages/:messageId/reactions', authenticate, validateParams(messageIdSchema), validateBody(reactionSchema), chatController.addReaction);

router.delete('/messages/:messageId/reactions', authenticate, validateParams(messageIdSchema), validateBody(reactionSchema), chatController.removeReaction);

router.put('/messages/:messageId', authenticate, validateParams(messageIdSchema), validateBody(editMessageSchema), chatController.editMessage);

router.delete('/messages/:messageId', authenticate, validateParams(messageIdSchema), chatController.deleteMessage);

router.post('/conversations/:conversationId/read', authenticate, validateParams(conversationIdSchema), checkConversationAccess, chatController.markAsRead);

router.get('/conversations/:conversationId/search', authenticate, validateParams(conversationIdSchema), validateQuery(searchQuerySchema), checkConversationAccess, chatController.searchMessages);

module.exports = router;