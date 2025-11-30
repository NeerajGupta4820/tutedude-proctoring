import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getMyProfile,
  updateMyProfile,
  resetPassword,
  updatePassword,
  approveCandidate,
  rejectCandidate,
} from '../controllers/candidateController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Accept photos
  if (file.fieldname === 'photo') {
    if (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for photo'), false);
    }
  }
  // Accept resumes (PDF, DOC, DOCX)
  else if (file.fieldname === 'resume') {
    if (
      [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or DOC files are allowed for resume'), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Routes
router.post(
  '/create',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  createCandidate
);

router.get('/all', getAllCandidates);
router.get('/:id', getCandidateById);

router.put(
  '/:id',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  updateCandidate
);

router.delete('/:id', deleteCandidate);

// Candidate profile routes (require authentication)
router.get('/profile/me', requireAuth, getMyProfile);
router.put('/profile/me', requireAuth, updateMyProfile);

// Password management routes
router.post('/password/reset', resetPassword); // Admin can reset password
router.put('/password/update', requireAuth, updatePassword); // Candidate can update their own password

// Approval routes (Admin)
router.post('/:candidateId/approve', approveCandidate); // Approve candidate
router.post('/:candidateId/reject', rejectCandidate); // Reject candidate

export default router;
