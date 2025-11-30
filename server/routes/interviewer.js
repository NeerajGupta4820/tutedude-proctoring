import express from 'express';
import {
  getAllInterviewers,
  getInterviewerById,
  updateInterviewer,
  deleteInterviewer,
  approveCandidateForInterview,
  revokeCandidateApproval,
  getPendingCandidates,
  getApprovedCandidates,
} from '../controllers/interviewerController.js';

const router = express.Router();

// Interviewer profile routes
router.get('/all', getAllInterviewers);
router.get('/:id', getInterviewerById);
router.put('/:id', updateInterviewer);
router.delete('/:id', deleteInterviewer);

// Candidate approval routes
router.post(
  '/:id/approve-candidate/:candidateId',
  approveCandidateForInterview
);
router.post('/:id/revoke-candidate/:candidateId', revokeCandidateApproval);

// Candidate status routes
router.get('/:id/pending-candidates', getPendingCandidates);
router.get('/:id/approved-candidates', getApprovedCandidates);

export default router;
