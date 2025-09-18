import express from 'express';
import meetingCtrl from '../controllers/meetingController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAdmin, meetingCtrl.createMeeting);
router.get('/', requireAdmin, meetingCtrl.getAllMeetings);
router.get('/:id', requireAdmin, meetingCtrl.getMeeting);
router.patch('/:id', requireAdmin, meetingCtrl.updateMeeting);
router.get('/users', requireAdmin, meetingCtrl.getAllUsers);
router.get('/next', requireAuth, meetingCtrl.getNextMeeting);


// Sync code editor visibility for a meeting;
router.post('/:id/editor-open', requireAdmin, meetingCtrl.setEditorOpen); // set editor open status
router.get('/:id/editor-open', requireAdmin, meetingCtrl.getEditorOpen); // get editor open status

export default router;
