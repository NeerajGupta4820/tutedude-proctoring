import express from 'express';
import questionCtrl from '../controllers/questionController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ============ Public/Auth Routes ============
router.get('/', requireAuth, questionCtrl.getAllQuestions);
router.get('/:id', requireAuth, questionCtrl.getQuestion);
router.get('/slug/:slug', requireAuth, questionCtrl.getQuestionBySlug);
router.get('/category/:category', requireAuth, questionCtrl.getQuestionsByCategory);
router.get('/difficulty/:difficulty',requireAuth,questionCtrl.getQuestionsByDifficulty);

// ============ Admin Routes ============
router.post('/', requireAdmin, questionCtrl.createQuestion);
router.patch('/:id', requireAdmin, questionCtrl.updateQuestion);
router.delete('/:id', requireAdmin, questionCtrl.deleteQuestion);
router.post('/bulk', requireAdmin, questionCtrl.bulkCreateQuestions);
router.get('/stats/overview', requireAdmin, questionCtrl.getQuestionsStats);

export default router;