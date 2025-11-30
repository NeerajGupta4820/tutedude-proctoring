import Candidate from '../models/Candidate.js';
import { ApiError } from '../middleware/errorHandler.js';

// Create a new candidate
export const createCandidate = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      description,
      position,
      experience,
      status,
      interviewDate,
      notes,
      password,
    } = req.body;
    console.log(req.body, 'body');
    // Validate required fields
    if (!name || !email) {
      return next(new ApiError(400, 'Name and email are required'));
    }

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({
      email: email.toLowerCase(),
    });
    if (existingCandidate) {
      return next(
        new ApiError(409, 'Candidate with this email already exists')
      );
    }

    // Handle file uploads
    let photoPath = null;
    let resumePath = null;

    if (req.files) {
      if (req.files.photo) {
        photoPath = req.files.photo[0].path;
      }
      if (req.files.resume) {
        resumePath = req.files.resume[0].path;
      }
    }

    // Create candidate
    const candidate = new Candidate({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      description: description?.trim() || '',
      photo: photoPath,
      resume: resumePath,
      position: position?.trim() || '',
      experience: experience?.trim() || 'fresher',
      status: status?.trim() || 'pending',
      interviewDate: interviewDate || null,
      notes: notes?.trim() || '',
      password: password || null,
      isApproved: false,
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate,
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    next(error);
  }
};

// Get all candidates
export const getAllCandidates = async (req, res, next) => {
  try {
    const { status, experience, position } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (experience) filter.experience = experience;
    if (position) filter.position = position;

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

// Get candidate by ID
export const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Update candidate
export const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      description,
      position,
      experience,
      status,
      interviewDate,
      notes,
    } = req.body;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    // Update fields
    if (name) candidate.name = name.trim();
    if (email) candidate.email = email.toLowerCase().trim();
    if (phone) candidate.phone = phone.trim();
    if (description) candidate.description = description.trim();
    if (position) candidate.position = position.trim();
    if (experience) candidate.experience = experience;
    if (status) candidate.status = status;
    if (interviewDate) candidate.interviewDate = interviewDate;
    if (notes) candidate.notes = notes.trim();

    // Update file paths if new files are uploaded
    if (req.files) {
      if (req.files.photo) {
        candidate.photo = req.files.photo[0].path;
      }
      if (req.files.resume) {
        candidate.resume = req.files.resume[0].path;
      }
    }

    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Delete candidate
export const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get my profile (Candidate)
export const getMyProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Update my profile (Candidate)
export const updateMyProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { name, phone, position, experience, description, notes } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    // Update allowed fields
    if (name) candidate.name = name.trim();
    if (phone) candidate.phone = phone.trim();
    if (position) candidate.position = position.trim();
    if (experience) candidate.experience = experience;
    if (description) candidate.description = description.trim();
    if (notes) candidate.notes = notes.trim();

    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Reset password (Admin)
export const resetPassword = async (req, res, next) => {
  try {
    const { candidateId, newPassword } = req.body;

    if (!candidateId || !newPassword) {
      return next(
        new ApiError(400, 'Candidate ID and new password are required')
      );
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    candidate.password = newPassword;
    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Update own password (by candidate)
export const updatePassword = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(new ApiError(400, 'Old and new passwords are required'));
    }

    const candidate = await Candidate.findById(candidateId).select('+password');
    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    // Verify old password
    const isPasswordValid = await candidate.matchPassword(oldPassword);
    if (!isPasswordValid) {
      return next(new ApiError(400, 'Old password is incorrect'));
    }

    // Set new password
    candidate.password = newPassword;
    await candidate.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Approve candidate (Admin)
export const approveCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return next(new ApiError(400, 'Candidate ID is required'));
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { isApproved: true },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Candidate approved successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// Reject candidate (Admin)
export const rejectCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return next(new ApiError(400, 'Candidate ID is required'));
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { isApproved: false },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Candidate rejected',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};
