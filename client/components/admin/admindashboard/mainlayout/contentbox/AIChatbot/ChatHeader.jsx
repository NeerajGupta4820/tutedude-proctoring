import React from 'react';
import { FiMenu, FiTrash2, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const ChatHeader = ({
  title,
  isExpanded,
  onClearChat,
  onToggleExpand,
  onToggleSidebar,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-dashed border-gray-200">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Toggle sidebar"
        >
          <FiMenu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <HiSparkles className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {title || 'AI Interview Assistant'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 font-medium">
                Online & Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClearChat}
          className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Clear chat"
        >
          <FiTrash2 size={18} />
        </button>
        <button
          onClick={onToggleExpand}
          className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title={isExpanded ? 'Minimize' : 'Expand'}
        >
          {isExpanded ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
