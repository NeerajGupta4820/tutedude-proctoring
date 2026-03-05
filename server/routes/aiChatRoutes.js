// routes/aiChatRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js'; // ✅ FIX: requireAuth (not protect)
import {
  clearConversation,
  createConversation,
  deleteConversation,
  deleteMessage,
  getConversationMessages,
  getUserConversations,
  messageFeedback,
  searchConversations,
  togglePinConversation,
  updateConversationTitle,
} from '../controllers/aiChatController.js';

const router = express.Router();

// ✅ FIX: Use requireAuth
router.use(requireAuth);

router
  .route('/conversations')
  .get(getUserConversations)
  .post(createConversation);

router.get('/conversations/search', searchConversations);
router.patch('/conversations/:id/title', updateConversationTitle);
router.patch('/conversations/:id/pin', togglePinConversation);
router.delete('/conversations/:id', deleteConversation);
router.delete('/conversations/:id/clear', clearConversation);

router.get('/conversations/:id/messages', getConversationMessages);
router.delete('/messages/:messageId', deleteMessage);
router.patch('/messages/:messageId/feedback', messageFeedback);

export default router;
