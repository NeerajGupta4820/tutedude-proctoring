// routes/candidate.js
import express from 'express';
import multer from 'multer';
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

// ✅ Memory Storage - NO temp files created!
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'photo') {
    if (
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed'),
        false
      );
    }
  } else if (file.fieldname === 'resume') {
    if (
      [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or DOC files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage, // Memory storage
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Error handler
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);

// Routes
router.post('/create', uploadFields, handleMulterError, createCandidate);
router.get('/all', getAllCandidates);
router.get('/:id', getCandidateById);
router.put('/:id', uploadFields, handleMulterError, updateCandidate);
router.delete('/:id', deleteCandidate);

router.get('/profile/me', requireAuth, getMyProfile);
router.put(
  '/profile/me',
  requireAuth,
  uploadFields,
  handleMulterError,
  updateMyProfile
);

router.post('/password/reset', resetPassword);
router.put('/password/update', requireAuth, updatePassword);

router.post('/:candidateId/approve', approveCandidate);
router.post('/:candidateId/reject', rejectCandidate);

export default router;
