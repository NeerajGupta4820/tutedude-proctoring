import React from 'react';
import { FiMenu, FiTrash2, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

const ChatHeader = ({
  title,
  isExpanded,
  onClearChat,
  onToggleExpand,
  onToggleSidebar,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMenu size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">
              {title || 'AI Assistant'}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-[11px] text-gray-500">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={onClearChat}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Clear chat"
        >
          <FiTrash2 size={16} />
        </button>
        <button
          onClick={onToggleExpand}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={isExpanded ? 'Minimize' : 'Expand'}
        >
          {isExpanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
