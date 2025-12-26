import React, { useState, useContext, useCallback } from 'react';
import {
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaDownload,
  FaExpand,
  FaUser,
  FaEye,
  FaSpinner,
  FaUserTie,
  FaUpload,
  FaSync,
} from 'react-icons/fa';
import { AuthContext } from '../AuthContext';
import ResumePreviewModal from '../dialogs/ResumePreviewModal';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const ResumePanel = ({
  candidate,
  onClose,
  loading: dataLoading,
  userResume,
  onRefreshCandidate, // ✅ New prop - callback to refresh candidate data from parent
}) => {
  const { user } = useContext(AuthContext);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localResumeData, setLocalResumeData] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isViewingOwnResume = !isAdmin;

  // ✅ Refresh function for candidate to fetch latest data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(false);
    setPreviewLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };

      if (isAdmin && candidate?._id) {
        // Admin refreshing candidate data
        console.log('🔄 Admin refreshing candidate data...');
        const res = await axios.get(
          `${API_BASE_URL}/candidate/${candidate._id}`,
          { headers }
        );

        if (res.data.success && res.data.data) {
          setLocalResumeData({
            resumeUrl: res.data.data.resume,
            name: res.data.data.name,
            email: res.data.data.email,
            photo: res.data.data.photo,
            position: res.data.data.position,
            isOwn: false,
          });
          console.log(
            '✅ Candidate data refreshed:',
            res.data.data.resume ? 'Has Resume' : 'No Resume'
          );

          // Also call parent refresh if available
          if (onRefreshCandidate) {
            onRefreshCandidate(res.data.data);
          }
        }
      } else if (!isAdmin && user?.id) {
        // Candidate refreshing their own data
        console.log('🔄 Candidate refreshing own data...');

        // Try to fetch from candidate API first
        try {
          const res = await axios.get(`${API_BASE_URL}/candidate/profile/me`, {
            headers,
          });

          if (res.data.success && res.data.data) {
            setLocalResumeData({
              resumeUrl: res.data.data.resume,
              name: res.data.data.name,
              email: res.data.data.email,
              photo: res.data.data.photo,
              position: res.data.data.position,
              isOwn: true,
            });
            console.log(
              '✅ Own resume data refreshed:',
              res.data.data.resume ? 'Has Resume' : 'No Resume'
            );
          }
        } catch (profileErr) {
          console.log('⚠️ Profile API failed, trying user API...');

          // Fallback to user API
          try {
            const userRes = await axios.get(`${API_BASE_URL}/auth/me`, {
              headers,
            });

            if (userRes.data.success && userRes.data.data) {
              setLocalResumeData({
                resumeUrl: userRes.data.data.resume,
                name: userRes.data.data.name,
                email: userRes.data.data.email,
                photo: userRes.data.data.photo,
                position: userRes.data.data.position || 'Candidate',
                isOwn: true,
              });
              console.log(
                '✅ User data refreshed:',
                userRes.data.data.resume ? 'Has Resume' : 'No Resume'
              );
            }
          } catch (userErr) {
            console.error('❌ Failed to refresh user data:', userErr);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAdmin, candidate, user, onRefreshCandidate]);

  // Get resume data based on role
  const getResumeData = useCallback(() => {
    // Use local refreshed data if available
    if (localResumeData) {
      return localResumeData;
    }

    if (isAdmin && candidate) {
      return {
        resumeUrl: candidate.resume,
        name: candidate.name,
        email: candidate.email,
        photo: candidate.photo,
        position: candidate.position,
        isOwn: false,
      };
    } else if (!isAdmin) {
      return {
        resumeUrl: userResume || user?.resume,
        name: user?.name || 'You',
        email: user?.email,
        photo: user?.photo,
        position: user?.position || 'Candidate',
        isOwn: true,
      };
    }
    return null;
  }, [isAdmin, candidate, userResume, user, localResumeData]);

  const resumeData = getResumeData();

  // Data Loading state
  if (dataLoading) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-600 to-cyan-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <FaFileAlt className="text-white" size={16} />
            </div>
            <h2 className="text-white font-bold">Resume</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg"
          >
            <FaTimes size={18} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-cyan-600 text-3xl mx-auto mb-4" />
            <p className="text-gray-500">Loading resume data...</p>
          </div>
        </div>
      </div>
    );
  }

  const resumeUrl = resumeData?.resumeUrl;

  // No resume state
  if (!resumeUrl) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-600 to-cyan-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <FaFileAlt className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-white font-bold">Resume</h2>
              <p className="text-xs text-cyan-100">
                {isViewingOwnResume ? 'Your document' : 'Candidate document'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* ✅ Refresh Button in Header */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors ${
                isRefreshing
                  ? 'bg-white/10 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Refresh to check for resume"
            >
              <FaSync
                size={16}
                className={`text-white ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-300">
              <FaFileAlt size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Resume Available
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {isViewingOwnResume
                ? "You haven't uploaded a resume yet."
                : candidate
                  ? `${candidate.name} hasn't uploaded a resume yet.`
                  : "Candidate hasn't uploaded a resume yet."}
            </p>

            {/* Show user info */}
            <div className="bg-gray-100 rounded-lg p-3 text-left inline-block mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {isViewingOwnResume ? (
                  <FaUserTie size={12} />
                ) : (
                  <FaUser size={12} />
                )}
                <span>{resumeData?.name || 'Unknown'}</span>
              </div>
            </div>

            {/* ✅ Refresh Button for Candidate */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto transition-colors ${
                  isRefreshing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <FaSync
                  size={14}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                {isRefreshing ? 'Refreshing...' : 'Refresh to Check Resume'}
              </button>

              {/* Upload button for candidate */}
              {isViewingOwnResume && (
                <button
                  onClick={() => {
                    window.location.href = '/profile';
                  }}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
                >
                  <FaUpload size={14} />
                  Upload Resume
                </button>
              )}
            </div>

            {/* Hint for candidate */}
            {isViewingOwnResume && (
              <p className="text-xs text-gray-400 mt-4">
                💡 If admin has shared your resume, click "Refresh" to load it
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getFileType = () => {
    if (!resumeUrl) return 'file';
    const url = resumeUrl.toLowerCase();
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.doc')) return 'doc';
    if (url.includes('.docx')) return 'docx';
    if (url.includes('cloudinary.com') && url.includes('/raw/')) return 'pdf';
    return 'file';
  };

  const fileType = getFileType();

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" size={18} />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500" size={18} />;
      default:
        return <FaFileAlt className="text-gray-500" size={18} />;
    }
  };

  const getPreviewUrl = () => {
    if (resumeUrl.includes('cloudinary.com')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`;
    }
    if (fileType === 'pdf') {
      return resumeUrl;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`;
  };

  const handleDownload = () => {
    let downloadUrl = resumeUrl;
    if (resumeUrl.includes('cloudinary.com')) {
      downloadUrl = resumeUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    const fileName = `${resumeData?.name?.replace(/\s+/g, '_') || 'resume'}_resume`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(resumeUrl, '_blank');
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Resume Preview Modal */}
      {showPreviewModal && (
        <ResumePreviewModal
          resumeUrl={resumeUrl}
          name={resumeData?.name}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-600 to-cyan-700 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              fileType === 'pdf' ? 'bg-red-500/20' : 'bg-blue-500/20'
            }`}
          >
            {getFileIcon()}
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold truncate">
              {isViewingOwnResume
                ? 'My Resume'
                : `${resumeData?.name}'s Resume`}
            </h2>
            <p className="text-xs text-cyan-100 uppercase flex items-center gap-1">
              {fileType} Document
              {isViewingOwnResume && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] ml-1">
                  Your File
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-colors ${
              isRefreshing
                ? 'bg-white/10 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30'
            }`}
            title="Refresh resume data"
          >
            <FaSync
              size={14}
              className={`text-white ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          >
            <FaTimes size={18} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 p-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => setShowPreviewModal(true)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FaEye size={12} />
          Preview
        </button>
        <button
          onClick={openInNewTab}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <FaExpand size={12} />
          New Tab
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FaDownload size={12} />
          Download
        </button>
      </div>

      {/* User/Candidate Info */}
      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          {resumeData?.photo ? (
            <img
              src={resumeData.photo}
              alt={resumeData.name}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">
                {resumeData?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800 text-sm truncate">
                {resumeData?.name}
              </p>
              {isViewingOwnResume && (
                <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
              {isAdmin && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                  Candidate
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {resumeData?.position || resumeData?.email}
            </p>
          </div>
          {/* Quick Preview Button */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors"
            title="Quick Preview"
          >
            <FaEye size={14} />
          </button>
        </div>
      </div>

      {/* Inline Preview */}
      <div className="flex-1 bg-gray-200 relative overflow-hidden">
        {previewLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading resume...</p>
              <p className="text-gray-400 text-xs mt-1">
                This may take a moment
              </p>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaFileAlt className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-gray-800 font-semibold mb-2">
                Preview Unavailable
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Cannot preview this document format directly.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FaEye size={14} />
                  Open Preview Modal
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={openInNewTab}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Open in Browser
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <iframe
              src={getPreviewUrl()}
              className="w-full h-full border-0"
              title="Resume Preview"
              onLoad={() => setPreviewLoading(false)}
              onError={() => {
                setPreviewLoading(false);
                setError(true);
              }}
            />

            {/* Floating Preview Button */}
            <button
              onClick={() => setShowPreviewModal(true)}
              className="absolute bottom-4 right-4 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all hover:scale-105"
            >
              <FaExpand size={14} />
              Full Screen Preview
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumePanel;
