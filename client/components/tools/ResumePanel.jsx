import React, { useState } from 'react';
import {
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaDownload,
  FaExpand,
  FaEye,
} from 'react-icons/fa';

const ResumePanel = ({ candidate, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!candidate?.resume) {
    return (
      <div className="w-[500px] h-full bg-gray-900 border-l border-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FaFileAlt size={48} className="mx-auto mb-4 opacity-50" />
          <p>No resume available</p>
        </div>
      </div>
    );
  }

  const resumeUrl = candidate.resume;

  // Get file type
  const getFileType = () => {
    if (!resumeUrl) return 'file';
    const url = resumeUrl.toLowerCase();
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.doc')) return 'doc';
    if (url.includes('.docx')) return 'docx';
    return 'file';
  };

  const fileType = getFileType();

  // Get file icon
  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="text-red-400" size={18} />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-400" size={18} />;
      default:
        return <FaFileAlt className="text-gray-400" size={18} />;
    }
  };

  // Get preview URL
  const getPreviewUrl = () => {
    if (resumeUrl.includes('cloudinary.com')) {
      if (fileType === 'pdf') {
        return resumeUrl;
      }
      return `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`;
    }
    if (fileType === 'pdf') {
      return resumeUrl;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`;
  };

  // Download handler
  const handleDownload = () => {
    let downloadUrl = resumeUrl;
    if (resumeUrl.includes('cloudinary.com')) {
      downloadUrl = resumeUrl.replace('/upload/', '/upload/fl_attachment/');
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

  // Open in new tab
  const openInNewTab = () => {
    window.open(resumeUrl, '_blank');
  };

  return (
    <div className="w-[500px] h-full bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              fileType === 'pdf' ? 'bg-red-500/20' : 'bg-blue-500/20'
            }`}
          >
            {getFileIcon()}
          </div>
          <div>
            <h2 className="text-white font-bold">{candidate.name}'s Resume</h2>
            <p className="text-xs text-gray-400 uppercase">
              {fileType} Document
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 p-3 border-b border-gray-700 bg-gray-800/50">
        <button
          onClick={openInNewTab}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          <FaExpand size={12} />
          Open in New Tab
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <FaDownload size={12} />
          Download
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-gray-800 relative">
        {/* Loading */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Loading resume...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaFileAlt className="text-gray-500 text-2xl" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                Preview Unavailable
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Cannot preview this document format directly.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={openInNewTab}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                >
                  Open in Browser
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={getPreviewUrl()}
            className="w-full h-full border-0"
            title="Resume Preview"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ResumePanel;
