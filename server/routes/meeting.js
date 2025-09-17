import express from 'express';
import meetingCtrl from '../controllers/meetingController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAdmin, meetingCtrl.createMeeting);
router.get('/', requireAdmin, meetingCtrl.getAllMeetings);
router.patch('/:id', requireAdmin, meetingCtrl.updateMeeting);
router.get('/users', requireAdmin, meetingCtrl.getAllUsers);
router.get('/next', requireAuth, meetingCtrl.getNextMeeting);

export default router;
