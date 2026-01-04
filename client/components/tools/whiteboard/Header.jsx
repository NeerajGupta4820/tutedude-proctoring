// components/whiteboard/Header.jsx
import React from 'react';
import {
  FaTimes,
  FaPen,
  FaExpand,
  FaCompress,
  FaSearchPlus,
  FaSearchMinus,
  FaLock,
  FaUnlock,
  FaUsers,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { BsArrowsMove, BsGrid3X3 } from 'react-icons/bs';

const Header = ({
  activeUsers = [],
  isLocked,
  zoom,
  showGrid,
  showCursors,
  isFullscreen,
  isInterviewer,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleGrid,
  onToggleCursors,
  onToggleLock,
  onToggleFullscreen,
  onClose,
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-2 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white flex-shrink-0 z-10">
      {/* Left Section - Logo & Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <FaPen className="text-sm" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Whiteboard</h2>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <FaUsers size={10} />
              {activeUsers.length + 1} active
            </span>
            {isLocked && (
              <span className="flex items-center gap-1 text-yellow-300">
                <FaLock size={10} />
                Locked
              </span>
            )}
            {isFullscreen && (
              <span className="flex items-center gap-1 text-green-300">
                • Fullscreen
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-1">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1 mr-2">
          <button
            onClick={onZoomOut}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Zoom Out"
          >
            <FaSearchMinus size={14} />
          </button>
          <span className="text-xs font-medium w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Zoom In"
          >
            <FaSearchPlus size={14} />
          </button>
          <button
            onClick={onZoomReset}
            className="p-1.5 hover:bg-white/20 rounded ml-1 transition-colors"
            title="Reset Zoom"
          >
            <BsArrowsMove size={14} />
          </button>
        </div>

        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`p-2 rounded-lg transition-colors ${
            showGrid ? 'bg-white/30' : 'hover:bg-white/20'
          }`}
          title="Toggle Grid"
        >
          <BsGrid3X3 size={16} />
        </button>

        {/* Cursors Toggle */}
        <button
          onClick={onToggleCursors}
          className={`p-2 rounded-lg transition-colors ${
            showCursors ? 'bg-white/30' : 'hover:bg-white/20'
          }`}
          title="Show Cursors"
        >
          {showCursors ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
        </button>

        {/* Lock Toggle (Interviewer/Admin only) */}
        {isInterviewer && (
          <button
            onClick={onToggleLock}
            className={`p-2 rounded-lg transition-colors ${
              isLocked ? 'bg-yellow-500/50' : 'hover:bg-white/20'
            }`}
            title={isLocked ? 'Unlock Whiteboard' : 'Lock Whiteboard'}
          >
            {isLocked ? <FaLock size={16} /> : <FaUnlock size={16} />}
          </button>
        )}

        {/* Fullscreen Toggle (Admin only - synced with candidate) */}
        {isInterviewer && (
          <button
            onClick={onToggleFullscreen}
            className={`p-2 rounded-lg transition-colors ${
              isFullscreen ? 'bg-green-500/50' : 'hover:bg-white/20'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg ml-1 transition-colors"
          title="Close Whiteboard"
        >
          <FaTimes size={16} />
        </button>
      </div>
    </div>
  );
};

export default Header;
