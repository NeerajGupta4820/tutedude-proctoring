import User from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';

// Get all interviewers
export const getAllInterviewers = async (req, res, next) => {
  try {
    const interviewers = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interviewers.length,
      data: interviewers,
    });
  } catch (error) {
    next(error);
  }
};

// Get interviewer by ID
export const getInterviewerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interviewer = await User.findById(id).select('-password');

    if (!interviewer) {
      return next(new ApiError(404, 'Interviewer not found'));
    }

    if (interviewer.role !== 'admin') {
      return next(new ApiError(403, 'User is not an interviewer'));
    }

    res.status(200).json({
      success: true,
      data: interviewer,
    });
  } catch (error) {
    next(error);
  }
};

// Update interviewer profile
export const updateInterviewer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, expertise } = req.body;

    const interviewer = await User.findById(id);

    if (!interviewer) {
      return next(new ApiError(404, 'Interviewer not found'));
    }

    if (interviewer.role !== 'admin') {
      return next(new ApiError(403, 'User is not an interviewer'));
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== interviewer.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return next(new ApiError(409, 'Email already exists'));
      }
      interviewer.email = email.toLowerCase();
    }

    // Update fields
    if (name) interviewer.name = name;
    if (phone) interviewer.phone = phone;
    if (department) interviewer.department = department;
    if (expertise) interviewer.expertise = expertise;

    await interviewer.save();

    res.status(200).json({
      success: true,
      message: 'Interviewer updated successfully',
      data: interviewer,
    });
  } catch (error) {
    next(error);
  }
};

// Delete interviewer
export const deleteInterviewer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interviewer = await User.findByIdAndDelete(id);

    if (!interviewer) {
      return next(new ApiError(404, 'Interviewer not found'));
    }

    if (interviewer.role !== 'admin') {
      return next(new ApiError(403, 'User is not an interviewer'));
    }

    res.status(200).json({
      success: true,
      message: 'Interviewer deleted successfully',
      data: interviewer,
    });
  } catch (error) {
    next(error);
  }
};

// Approve candidate for interview
export const approveCandidateForInterview = async (req, res, next) => {
  try {
    const Candidate = require('../models/Candidate.js').default;
    const { candidateId } = req.params;

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    candidate.isApproved = true;
    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Candidate approved successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Revoke candidate approval
export const revokeCandidateApproval = async (req, res, next) => {
  try {
    const Candidate = require('../models/Candidate.js').default;
    const { candidateId } = req.params;

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    candidate.isApproved = false;
    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Candidate approval revoked',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Get pending candidates
export const getPendingCandidates = async (req, res, next) => {
  try {
    const Candidate = require('../models/Candidate.js').default;

    const candidates = await Candidate.find({ isApproved: false }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

// Get approved candidates
export const getApprovedCandidates = async (req, res, next) => {
  try {
    const Candidate = require('../models/Candidate.js').default;

    const candidates = await Candidate.find({ isApproved: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};
