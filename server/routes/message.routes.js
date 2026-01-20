// File: server/routes/message.routes.js

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  reportMessage
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');
const tenantIsolation = require('../middleware/tenantIsolation.middleware');
const messageFilter = require('../middleware/messageFilter.middleware');

router.use(protect);
router.use(tenantIsolation);

router.post('/send', messageFilter, sendMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getConversation);
router.put('/conversations/:conversationId/read', markAsRead);
router.delete('/messages/:id', deleteMessage);
router.post('/messages/:id/report', reportMessage);

module.exports = router;
