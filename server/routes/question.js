import express from 'express';
import questionCtrl from '../controllers/questionController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/', requireAdmin, questionCtrl.createQuestion);
router.get('/', requireAuth, questionCtrl.getAllQuestions);
router.get('/:id', requireAuth, questionCtrl.getQuestion);
router.patch('/:id', requireAdmin, questionCtrl.updateQuestion);
router.delete('/:id', requireAdmin, questionCtrl.deleteQuestion);

export default router;