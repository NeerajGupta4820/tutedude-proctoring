import express from 'express';
import interviewResultController from '../controllers/interviewResultController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============ Get Results ============
router.get('/', requireAdmin, interviewResultController.getAllResults);
router.get('/stats/dashboard',requireAdmin,interviewResultController.getDashboardStats);
router.get('/meeting/:meetingId',requireAuth,interviewResultController.getInterviewResult);
router.get('/candidate/:candidateId',requireAuth,interviewResultController.getCandidateResults);

// ============ Update Results ============
router.patch('/:resultId/evaluation',requireAuth,interviewResultController.updateEvaluation);
router.patch('/:resultId/result',requireAuth,interviewResultController.updateFinalResult);
router.patch('/:resultId/feedback',requireAuth,interviewResultController.addFeedback);
router.patch('/:resultId/question/:questionId/rating',requireAuth,interviewResultController.updateQuestionRating);
router.patch('/:resultId/integrity',requireAuth,interviewResultController.updateIntegrityFlags);

export default router;
