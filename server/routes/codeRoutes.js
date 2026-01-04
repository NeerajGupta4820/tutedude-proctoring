import express from 'express';
import codeController from '../controllers/codeController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============ Code Execution Routes ============
router.post('/run', requireAuth, codeController.runCode);
router.post('/submit', requireAuth, codeController.submitCode);

// ============ Submission Routes ============
router.get('/submissions/:submissionId',requireAuth,codeController.getSubmission);
router.get('/submissions/meeting/:meetingId',requireAuth,codeController.getMeetingSubmissions);
router.get('/submissions/meeting/:meetingId/question/:questionId',requireAuth,codeController.getQuestionSubmissions);
router.patch('/submissions/:submissionId/feedback',requireAuth,codeController.addFeedback);

// ============ Stats Routes ============
router.get('/stats/candidate/:candidateId',requireAuth,codeController.getCandidateStats);
router.get('/latest/:meetingId/:questionId/:candidateId',requireAuth,codeController.getLatestSubmission);

export default router;
