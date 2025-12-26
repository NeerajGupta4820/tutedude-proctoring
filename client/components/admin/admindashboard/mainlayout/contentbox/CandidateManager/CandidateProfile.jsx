import React, { useState } from 'react';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaStickyNote,
  FaUser,
  FaEye,
  FaFilePdf,
} from 'react-icons/fa';
import ImagePreviewModal from '../../../../../dialogs/ImagePreviewModal';
import ResumePreviewModal from '../../../../../dialogs/ResumePreviewModal';

const CandidateProfile = ({ candidate, onBack, onEdit, onDelete }) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getExperienceColor = (experience) => {
    switch (experience) {
      case 'fresher':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'junior':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'mid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'senior':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Download resume with candidate name
  const handleDownloadResume = () => {
    if (!candidate.resume) return;

    let downloadUrl = candidate.resume;
    if (downloadUrl.includes('cloudinary.com')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    const fileName = `${candidate.name?.replace(/\s+/g, '_') || 'candidate'}_resume`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg">
      {/* Image Preview Modal */}
      {showImagePreview && candidate.photo && (
        <ImagePreviewModal
          imageUrl={candidate.photo}
          name={candidate.name}
          onClose={() => setShowImagePreview(false)}
        />
      )}

      {/* Resume Preview Modal */}
      {showResumePreview && candidate.resume && (
        <ResumePreviewModal
          resumeUrl={candidate.resume}
          name={candidate.name}
          onClose={() => setShowResumePreview(false)}
        />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-medium transition-all"
            >
              <FaArrowLeft size={12} />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Candidate Profile
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                View candidate details
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FaEdit size={12} />
              <span>Edit</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FaTrash size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Photo & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                {/* Photo with click to preview */}
                <div className="mb-4 relative group">
                  {candidate.photo ? (
                    <div className="relative inline-block">
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        onClick={() => setShowImagePreview(true)}
                        className="w-32 h-32 rounded-2xl object-cover mx-auto border-4 border-dashed border-gray-200 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Hover overlay */}
                      <div
                        onClick={() => setShowImagePreview(true)}
                        className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                      >
                        <div className="text-white text-center">
                          <FaEye size={20} className="mx-auto mb-1" />
                          <span className="text-xs">Click to view</span>
                        </div>
                      </div>
                      {/* Fallback avatar (hidden by default) */}
                      <div className="w-32 h-32 bg-blue-100 rounded-2xl items-center justify-center mx-auto border-4 border-dashed border-blue-200 hidden">
                        <span className="text-4xl font-bold text-blue-600">
                          {candidate.name?.charAt(0).toUpperCase() || 'C'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto border-4 border-dashed border-blue-200">
                      <span className="text-4xl font-bold text-blue-600">
                        {candidate.name?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & Email */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {candidate.name}
                </h2>
                <p className="text-gray-500 text-sm mb-4">{candidate.email}</p>

                {/* Status Badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-dashed capitalize ${getStatusColor(candidate.status)}`}
                  >
                    {candidate.status || 'pending'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border border-dashed ${candidate.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                  >
                    {candidate.isApproved ? (
                      <>
                        <FaCheck size={10} /> Approved
                      </>
                    ) : (
                      <>
                        <FaTimes size={10} /> Not Approved
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Resume Card */}
              {candidate.resume && (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center border-2 border-dashed border-red-200">
                      <FaFilePdf className="text-red-600" size={14} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Resume</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Preview Button */}
                    <button
                      onClick={() => setShowResumePreview(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border-2 border-dashed border-gray-200 transition-all"
                    >
                      <FaEye size={14} />
                      <span>Preview Resume</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownloadResume}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FaDownload size={12} />
                      <span>Download Resume</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                    <FaUser className="text-blue-600" size={14} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FaEnvelope className="text-gray-400" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {candidate.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FaPhone className="text-gray-400" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">
                        {candidate.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
                    <FaBriefcase className="text-purple-600" size={14} />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Professional Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FaBriefcase className="text-gray-400" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Position</p>
                      <p className="font-medium text-gray-900">
                        {candidate.position || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FaGraduationCap className="text-gray-400" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Experience Level</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed capitalize ${getExperienceColor(candidate.experience)}`}
                      >
                        {candidate.experience || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FaCalendarAlt className="text-gray-400" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Interview Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(candidate.interviewDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FaCalendarAlt className="text-gray-400" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(candidate.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Notes */}
              {(candidate.description || candidate.notes) && (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                    <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center border-2 border-dashed border-yellow-200">
                      <FaStickyNote className="text-yellow-600" size={14} />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Additional Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {candidate.description && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Description
                        </p>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
                          {candidate.description}
                        </p>
                      </div>
                    )}

                    {candidate.notes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Internal Notes
                        </p>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
                          {candidate.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
