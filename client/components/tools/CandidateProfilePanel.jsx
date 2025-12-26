import React, { useState } from 'react';
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
  FaStickyNote,
  FaEye,
  FaDownload,
  FaFilePdf,
} from 'react-icons/fa';
import ImagePreviewModal from '../dialogs/ImagePreviewModal';
import ResumePreviewModal from '../dialogs/ResumePreviewModal';

const CandidateProfilePanel = ({ candidate, onClose }) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);

  if (!candidate) {
    return (
      <div className="w-full h-full bg-gray-900 border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center">
              <FaUser className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-white font-bold">Candidate Profile</h2>
              <p className="text-xs text-gray-400">View candidate details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center bg-gray-800">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-600">
              <FaUser size={40} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              No Candidate Data
            </h3>
            <p className="text-gray-400 text-sm">
              Candidate information not available at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getExperienceColor = (experience) => {
    switch (experience) {
      case 'fresher':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'junior':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'mid':
        return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'senior':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

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
    <div className="w-full h-full bg-gray-900 border-l border-gray-700 flex flex-col">
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

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FaUser className="text-white" size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold truncate">Candidate Profile</h2>
            <p className="text-xs text-gray-400">View candidate details</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          {/* Photo */}
          <div className="relative inline-block mb-3 group">
            {candidate.photo ? (
              <>
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  onClick={() => setShowImagePreview(true)}
                  className="w-24 h-24 rounded-xl object-cover border-2 border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div
                  onClick={() => setShowImagePreview(true)}
                  className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  <FaEye className="text-white" size={20} />
                </div>
              </>
            ) : (
              <div className="w-24 h-24 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {candidate.name?.charAt(0).toUpperCase() || 'C'}
                </span>
              </div>
            )}
          </div>

          {/* Name & Email */}
          <h3 className="text-white font-bold text-lg break-words">
            {candidate.name}
          </h3>
          <p className="text-gray-400 text-sm break-all">{candidate.email}</p>

          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(candidate.status)}`}
            >
              {candidate.status || 'pending'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${candidate.isApproved ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-red-500/20 text-red-400 border-red-500'}`}
            >
              {candidate.isApproved ? '✓ Approved' : '✗ Not Approved'}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaUser className="text-indigo-400" size={14} />
            Contact Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-gray-400" size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white text-sm break-all">
                  {candidate.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaPhone className="text-gray-400" size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-white text-sm">
                  {candidate.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaBriefcase className="text-purple-400" size={14} />
            Professional Details
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaBriefcase className="text-gray-400" size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Position</p>
                <p className="text-white text-sm break-words">
                  {candidate.position || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaGraduationCap className="text-gray-400" size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Experience</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium border capitalize ${getExperienceColor(candidate.experience)}`}
                >
                  {candidate.experience || 'Not specified'}
                </span>
              </div>
            </div>
            {candidate.interviewDate && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaCalendarAlt className="text-gray-400" size={12} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Interview Date</p>
                  <p className="text-white text-sm">
                    {new Date(candidate.interviewDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description & Notes */}
        {(candidate.description || candidate.notes) && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaStickyNote className="text-yellow-400" size={14} />
              Additional Info
            </h4>
            <div className="space-y-3">
              {candidate.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 text-sm bg-gray-700/50 rounded-lg p-2 break-words">
                    {candidate.description}
                  </p>
                </div>
              )}
              {candidate.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-300 text-sm bg-gray-700/50 rounded-lg p-2 break-words">
                    {candidate.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume Section */}
        {candidate.resume && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaFilePdf className="text-red-400" size={14} />
              Resume
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setShowResumePreview(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FaEye size={14} />
                Preview Resume
              </button>
              <button
                onClick={handleDownloadResume}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FaDownload size={14} />
                Download Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfilePanel;
