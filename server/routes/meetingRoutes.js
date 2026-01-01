import express from 'express';
import meetingCtrl from '../controllers/meetingController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', requireAdmin, meetingCtrl.getAllUsers);
router.get('/next', requireAuth, meetingCtrl.getNextMeeting);

router.post('/', requireAdmin, meetingCtrl.createMeeting);
router.get('/', requireAdmin, meetingCtrl.getAllMeetings);

router.get('/:id/editor-state', requireAuth, meetingCtrl.getEditorState);
router.post('/:id/editor-state', requireAuth, meetingCtrl.setEditorState);
router.get('/:id', requireAuth, meetingCtrl.getMeeting);
router.patch('/:id', requireAdmin, meetingCtrl.updateMeeting);

export default router;