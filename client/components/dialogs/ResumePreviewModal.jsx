import React, { useState } from 'react';
import {
  FaDownload,
  FaTimes,
  FaExpand,
  FaFilePdf,
  FaFileAlt,
  FaFileWord,
} from 'react-icons/fa';

const ResumePreviewModal = ({ resumeUrl, name, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getFileExtension = () => {
    if (!resumeUrl) return '';
    const url = resumeUrl.toLowerCase();
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.doc')) return 'doc';
    if (url.includes('.docx')) return 'docx';
    return 'file';
  };

  const fileType = getFileExtension();

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

  const handleDownload = () => {
    let downloadUrl = resumeUrl;
    if (resumeUrl.includes('cloudinary.com')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    const fileName = `${name?.replace(/\s+/g, '_') || 'candidate'}_resume`;
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

  const getPreviewUrl = () => {
    if (!resumeUrl) return '';

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

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl h-[95vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                fileType === 'pdf'
                  ? 'bg-red-500/20'
                  : fileType === 'doc' || fileType === 'docx'
                    ? 'bg-blue-500/20'
                    : 'bg-gray-500/20'
              }`}
            >
              {getFileIcon()}
            </div>
            <div>
              <h3 className="font-semibold truncate">{name}'s Resume</h3>
              <p className="text-xs text-gray-400 uppercase">
                {fileType || 'Document'} Preview
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openInNewTab}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              title="Open in new tab"
            >
              <FaExpand size={12} />
              <span className="hidden sm:inline">Open</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
              title="Download"
            >
              <FaDownload size={12} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              title="Close"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading preview...</p>
                <p className="text-gray-400 text-sm mt-1">
                  This may take a moment
                </p>
              </div>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-8 max-w-md">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-300">
                  <FaFileAlt className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Preview not available
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  This document cannot be previewed directly. You can open it in
                  a new tab or download it.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={openInNewTab}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FaExpand size={12} />
                    <span>Open in Browser</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <FaDownload size={12} />
                    <span>Download</span>
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

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex-shrink-0">
          <span>
            {fileType === 'pdf'
              ? 'PDF Document'
              : fileType === 'doc' || fileType === 'docx'
                ? 'Word Document'
                : 'Document'}
          </span>
          <span>Press ESC or click outside to close</span>
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewModal;
