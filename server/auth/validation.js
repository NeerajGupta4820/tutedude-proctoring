import { body, param, query, validationResult } from 'express-validator';
import { ApiError } from '../utils/response.js';
import { MEETING_STATUS, MEETING_TYPES, EXPERIENCE_LEVELS } from '../constants/meeting.constants.js';

/**
 * Handle validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

/**
 * Meeting creation validation rules
 */
export const createMeetingValidation = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format'),
  
  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Cannot schedule meeting in the past');
      }
      return true;
    }),
  
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  
  body('interviewConfig.type')
    .notEmpty().withMessage('Interview type is required')
    .isIn(Object.values(MEETING_TYPES)).withMessage('Invalid meeting type'),
  
  body('interviewConfig.category')
    .notEmpty().withMessage('Category is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters'),
  
  body('interviewConfig.jobRole')
    .notEmpty().withMessage('Job role is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Job role must be between 2 and 100 characters'),
  
  body('interviewConfig.round')
    .notEmpty().withMessage('Round is required')
    .trim(),
  
  body('interviewConfig.experienceLevel')
    .optional()
    .isIn(Object.values(EXPERIENCE_LEVELS)).withMessage('Invalid experience level'),
  
  body('assignedQuestions')
    .optional()
    .isArray().withMessage('Assigned questions must be an array'),
  
  body('assignedQuestions.*.question')
    .optional()
    .isMongoId().withMessage('Invalid question ID'),
  
  body('assignedQuestions.*.timeAllocated')
    .optional()
    .isInt({ min: 1 }).withMessage('Time allocated must be positive'),
  
  validate,
];

/**
 * Meeting update validation rules
 */
export const updateMeetingValidation = [
  param('id')
    .isMongoId().withMessage('Invalid meeting ID'),
  
  body('status')
    .optional()
    .isIn(Object.values(MEETING_STATUS)).withMessage('Invalid status'),
  
  body('evaluation.overallRating')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
  
  body('evaluation.result')
    .optional()
    .isIn(['selected', 'rejected', 'on-hold', 'pending']).withMessage('Invalid result'),
  
  validate,
];

/**
 * Query parameter validation
 */
export const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(Object.values(MEETING_STATUS)).withMessage('Invalid status filter'),
  
  query('type')
    .optional()
    .isIn(Object.values(MEETING_TYPES)).withMessage('Invalid type filter'),
  
  validate,
];

/**
 * Meeting ID validation
 */
export const meetingIdValidation = [
  param('id').isMongoId().withMessage('Invalid meeting ID'),
  validate,
];