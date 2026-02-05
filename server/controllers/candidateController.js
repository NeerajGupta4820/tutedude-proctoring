// controllers/candidateController.js
import Candidate from '../models/CandidateSchema.js';
import { ApiError } from '../middleware/errorHandler.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinaryUpload.js';

// Cloudinary folder structure
const CLOUDINARY_FOLDERS = {
  photo: 'tutedude/profile',
  resume: 'tutedude/resume',
};

// Start: New helper for single file upload
export const uploadFile = async (req, res, next) => {
  try {
    const isPhoto = !!req.files?.photo?.[0];
    const isResume = !!req.files?.resume?.[0];

    if (!isPhoto && !isResume) {
      return next(new ApiError(400, 'No file uploaded'));
    }

    let result;
    if (isPhoto) {
      result = await uploadToCloudinary(
        req.files.photo[0].buffer,
        CLOUDINARY_FOLDERS.photo,
        'image'
      );
    } else {
      result = await uploadToCloudinary(
        req.files.resume[0].buffer,
        CLOUDINARY_FOLDERS.resume,
        'raw'
      );
    }

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { publicId, resourceType } = req.body;
    if (!publicId) return next(new ApiError(400, 'Public ID required'));

    await deleteFromCloudinary(publicId, resourceType || 'image');

    res.status(200).json({ success: true, message: 'File deleted' });
  } catch (error) {
    next(error);
  }
};
// End: New helper

// Create candidate
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

    console.log('📝 Creating candidate:', { name, email });
    console.log('📎 Files received:', {
      photo: req.files?.photo?.[0] ? `${req.files.photo[0].size} bytes` : 'No',
      resume: req.files?.resume?.[0]
        ? `${req.files.resume[0].size} bytes`
        : 'No',
    });

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

    // Parallel upload to Cloudinary (or use pre-uploaded)
    let photoResult = null;
    let resumeResult = null;
    const uploadPromises = [];

    // Photo: Check file first, then body (pre-uploaded)
    if (req.files?.photo?.[0]?.buffer) {
      console.log('📸 Uploading photo to Cloudinary...');
      uploadPromises.push(
        uploadToCloudinary(
          req.files.photo[0].buffer,
          CLOUDINARY_FOLDERS.photo,
          'image'
        )
          .then((result) => {
            photoResult = result;
            console.log('✅ Photo uploaded:', result.url);
          })
          .catch((err) => {
            console.error('❌ Photo upload failed:', err.message);
          })
      );
    } else if (req.body.photoUrl && req.body.photoPublicId) {
      console.log('📸 Using pre-uploaded photo:', req.body.photoUrl);
      photoResult = {
        url: req.body.photoUrl,
        publicId: req.body.photoPublicId,
      };
    }

    // Resume: Check file first, then body (pre-uploaded)
    if (req.files?.resume?.[0]?.buffer) {
      console.log('📄 Uploading resume to Cloudinary...');
      uploadPromises.push(
        uploadToCloudinary(
          req.files.resume[0].buffer,
          CLOUDINARY_FOLDERS.resume,
          'raw'
        )
          .then((result) => {
            resumeResult = result;
            console.log('✅ Resume uploaded:', result.url);
          })
          .catch((err) => {
            console.error('❌ Resume upload failed:', err.message);
          })
      );
    } else if (req.body.resumeUrl && req.body.resumePublicId) {
      console.log('📄 Using pre-uploaded resume:', req.body.resumeUrl);
      resumeResult = {
        url: req.body.resumeUrl,
        publicId: req.body.resumePublicId,
      };
    }

    // Wait for all uploads
    if (uploadPromises.length > 0) {
      console.log('⏳ Waiting for uploads to complete...');
      await Promise.all(uploadPromises);
      console.log('✅ All uploads completed');
    }

    // Create candidate document
    const candidate = new Candidate({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      description: description?.trim() || '',
      photo: photoResult?.url || null,
      photoPublicId: photoResult?.publicId || null,
      resume: resumeResult?.url || null,
      resumePublicId: resumeResult?.publicId || null,
      position: position?.trim() || '',
      experience: experience?.trim() || 'fresher',
      status: status?.trim() || 'pending',
      interviewDate: interviewDate || null,
      notes: notes?.trim() || '',
      password: password || null,
      isApproved: false,
    });

    await candidate.save();
    console.log('✅ Candidate saved:', candidate._id);

    // Prepare response (hide sensitive fields)
    const response = candidate.toObject();
    delete response.password;
    delete response.photoPublicId;
    delete response.resumePublicId;

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: response,
    });
  } catch (error) {
    console.error('❌ Error creating candidate:', error);
    next(error);
  }
};

// Get all candidates
export const getAllCandidates = async (req, res, next) => {
  try {
    const { status, experience, position, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (experience) filter.experience = experience;
    if (position) filter.position = { $regex: position, $options: 'i' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    const candidates = await Candidate.find(filter)
      .select('-password -photoPublicId -resumePublicId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error('❌ Error getting candidates:', error);
    next(error);
  }
};

// Get candidate by ID
export const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id).select(
      '-password -photoPublicId -resumePublicId'
    );

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    console.error('❌ Error getting candidate:', error);
    next(error);
  }
};

// Update candidate
export const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('📝 Updating candidate:', id);
    console.log('📎 Files received:', {
      photo: req.files?.photo?.[0] ? 'Yes' : 'No',
      resume: req.files?.resume?.[0] ? 'Yes' : 'No',
    });

    // Get candidate with public IDs for deletion
    const candidate = await Candidate.findById(id).select(
      '+photoPublicId +resumePublicId'
    );

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    // Update text fields
    const allowedFields = [
      'name',
      'email',
      'phone',
      'description',
      'position',
      'experience',
      'status',
      'interviewDate',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === 'email') {
          candidate[field] = updateData[field].toLowerCase().trim();
        } else if (typeof updateData[field] === 'string') {
          candidate[field] = updateData[field].trim();
        } else {
          candidate[field] = updateData[field];
        }
      }
    });

    // Handle file uploads (parallel)
    const uploadPromises = [];

    // Update photo
    if (req.files?.photo?.[0]?.buffer) {
      uploadPromises.push(
        (async () => {
          // Delete old photo from Cloudinary
          if (candidate.photoPublicId) {
            console.log('🗑️ Deleting old photo:', candidate.photoPublicId);
            await deleteFromCloudinary(candidate.photoPublicId, 'image');
          }

          // Upload new photo
          console.log('📸 Uploading new photo...');
          const result = await uploadToCloudinary(
            req.files.photo[0].buffer,
            CLOUDINARY_FOLDERS.photo,
            'image'
          );
          candidate.photo = result.url;
          candidate.photoPublicId = result.publicId;
          console.log('✅ Photo updated:', result.url);
        })()
      );
    }

    // Update resume
    if (req.files?.resume?.[0]?.buffer) {
      uploadPromises.push(
        (async () => {
          // Delete old resume from Cloudinary
          if (candidate.resumePublicId) {
            console.log('🗑️ Deleting old resume:', candidate.resumePublicId);
            await deleteFromCloudinary(candidate.resumePublicId, 'raw');
          }

          // Upload new resume
          console.log('📄 Uploading new resume...');
          const result = await uploadToCloudinary(
            req.files.resume[0].buffer,
            CLOUDINARY_FOLDERS.resume,
            'raw'
          );
          candidate.resume = result.url;
          candidate.resumePublicId = result.publicId;
          console.log('✅ Resume updated:', result.url);
        })()
      );
    }

    // Wait for all uploads
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    await candidate.save();
    console.log('✅ Candidate updated:', candidate._id);

    // Prepare response
    const response = candidate.toObject();
    delete response.password;
    delete response.photoPublicId;
    delete response.resumePublicId;

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: response,
    });
  } catch (error) {
    console.error('❌ Error updating candidate:', error);
    next(error);
  }
};

// Delete candidate (with Cloudinary cleanup)
export const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting candidate:', id);

    // Get candidate with public IDs
    const candidate = await Candidate.findById(id).select(
      '+photoPublicId +resumePublicId'
    );

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    // Delete files from Cloudinary (parallel)
    const deletePromises = [];

    if (candidate.photoPublicId) {
      console.log(
        '🗑️ Deleting photo from Cloudinary:',
        candidate.photoPublicId
      );
      deletePromises.push(
        deleteFromCloudinary(candidate.photoPublicId, 'image')
          .then(() => console.log('✅ Photo deleted'))
          .catch((err) => console.error('❌ Photo delete failed:', err.message))
      );
    }

    if (candidate.resumePublicId) {
      console.log(
        '🗑️ Deleting resume from Cloudinary:',
        candidate.resumePublicId
      );
      deletePromises.push(
        deleteFromCloudinary(candidate.resumePublicId, 'raw')
          .then(() => console.log('✅ Resume deleted'))
          .catch((err) =>
            console.error('❌ Resume delete failed:', err.message)
          )
      );
    }

    // Wait for Cloudinary deletions
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }

    // Delete candidate from database
    await Candidate.findByIdAndDelete(id);
    console.log('✅ Candidate deleted from database');

    res.status(200).json({
      success: true,
      message: 'Candidate and associated files deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting candidate:', error);
    next(error);
  }
};

// Get my profile
export const getMyProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const candidate = await Candidate.findById(candidateId).select(
      '-password -photoPublicId -resumePublicId'
    );

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

// Update my profile
export const updateMyProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { name, phone, position, experience, description, notes } = req.body;

    const candidate = await Candidate.findById(candidateId).select(
      '+photoPublicId +resumePublicId'
    );

    if (!candidate) {
      return next(new ApiError(404, 'Candidate not found'));
    }

    // Update allowed fields
    if (name) candidate.name = name.trim();
    if (phone !== undefined) candidate.phone = phone.trim();
    if (position !== undefined) candidate.position = position.trim();
    if (experience) candidate.experience = experience;
    if (description !== undefined) candidate.description = description.trim();
    if (notes !== undefined) candidate.notes = notes.trim();

    // Handle file uploads (parallel)
    const uploadPromises = [];

    if (req.files?.photo?.[0]?.buffer) {
      uploadPromises.push(
        (async () => {
          if (candidate.photoPublicId) {
            await deleteFromCloudinary(candidate.photoPublicId, 'image');
          }
          const result = await uploadToCloudinary(
            req.files.photo[0].buffer,
            CLOUDINARY_FOLDERS.photo,
            'image'
          );
          candidate.photo = result.url;
          candidate.photoPublicId = result.publicId;
        })()
      );
    }

    if (req.files?.resume?.[0]?.buffer) {
      uploadPromises.push(
        (async () => {
          if (candidate.resumePublicId) {
            await deleteFromCloudinary(candidate.resumePublicId, 'raw');
          }
          const result = await uploadToCloudinary(
            req.files.resume[0].buffer,
            CLOUDINARY_FOLDERS.resume,
            'raw'
          );
          candidate.resume = result.url;
          candidate.resumePublicId = result.publicId;
        })()
      );
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    await candidate.save();

    const response = candidate.toObject();
    delete response.password;
    delete response.photoPublicId;
    delete response.resumePublicId;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: response,
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
    });
  } catch (error) {
    next(error);
  }
};

// Update password (Candidate)
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

    const isValid = await candidate.matchPassword(oldPassword);
    if (!isValid) {
      return next(new ApiError(400, 'Old password is incorrect'));
    }

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

// Approve candidate
export const approveCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return next(new ApiError(400, 'Candidate ID is required'));
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { isApproved: true },
      { new: true }
    ).select('-password -photoPublicId -resumePublicId');

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

// Reject candidate
export const rejectCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return next(new ApiError(400, 'Candidate ID is required'));
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { isApproved: false },
      { new: true }
    ).select('-password -photoPublicId -resumePublicId');

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
