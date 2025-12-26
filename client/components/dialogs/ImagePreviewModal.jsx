import React from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';

const ImagePreviewModal = ({ imageUrl, name, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    let downloadUrl = imageUrl;
    if (imageUrl.includes('cloudinary.com')) {
      downloadUrl = imageUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${name || 'image'}_photo`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
          <h3 className="text-white font-semibold truncate pr-4">{name}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              title="Download"
            >
              <FaDownload size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              title="Close"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Image */}
        <img
          src={imageUrl}
          alt={name}
          className="max-w-full max-h-[90vh] object-contain"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="50%" y="50%" fill="%239ca3af" font-size="14" text-anchor="middle" dy=".3em">Image not found</text></svg>';
          }}
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
