// ============================================
// FILE: server/src/routes/index.js
// ============================================
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const contactRoutes = require('./contact.routes');
const chatRoutes = require('./chat.routes');
const mediaRoutes = require('./media.routes');
const statusRoutes = require('./status.routes');
const callRoutes = require('./call.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contacts', contactRoutes);
router.use('/chats', chatRoutes);
router.use('/media', mediaRoutes);
router.use('/statuses', statusRoutes);
router.use('/calls', callRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Chat Platform API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      contacts: '/api/contacts',
      chats: '/api/chats',
      media: '/api/media',
      statuses: '/api/statuses',
      calls: '/api/calls',
    },
  });
});

module.exports = router;