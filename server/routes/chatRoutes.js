// routes/chatRoutes.js
import express from 'express';
import chatCtrl from '../controllers/chatController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get chats by room ID (for socket/frontend use)
router.get('/room/:roomId', requireAuth, chatCtrl.getChatsByRoomId);

// Meeting chat routes (use ObjectId)
router.get('/meeting/:meetingId', requireAuth, chatCtrl.getChatsByMeeting);
router.post('/meeting/:meetingId', requireAuth, chatCtrl.sendMessage);
router.get('/meeting/:meetingId/stats', requireAuth, chatCtrl.getChatStats);
router.post('/meeting/:meetingId/read', requireAuth, chatCtrl.markAsRead);

// Delete routes
router.delete('/message/:messageId', requireAuth, chatCtrl.deleteMessage);
router.delete('/meeting/:meetingId/all', requireAdmin, chatCtrl.deleteAllChats);

export default router;
