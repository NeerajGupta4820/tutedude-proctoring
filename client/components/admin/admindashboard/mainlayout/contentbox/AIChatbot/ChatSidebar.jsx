// components/AIChatbot/ChatSidebar.jsx
import React, { useState } from 'react';
import {
  FaPlus,
  FaSearch,
  FaThumbtack,
  FaTrash,
  FaEllipsisV,
  FaTimes,
  FaEdit,
  FaCheck,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const ChatSidebar = ({
  conversations,
  activeConversation,
  isLoading,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onTogglePin,
  onUpdateTitle,
  onSearch,
  onCloseSidebar,
  isMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleStartEdit = (conv) => {
    setEditingId(conv._id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveEdit = (convId) => {
    if (editTitle.trim()) {
      onUpdateTitle(convId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const label = formatDate(conv.updatedAt || conv.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Header */}
      <div className="px-5 py-5 border-b-2 border-dashed border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
              <HiSparkles className="text-blue-600 text-sm" />
            </div>
            <span className="font-bold text-sm text-gray-900">
              Conversations
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
              title="New Chat"
            >
              <FaPlus size={12} />
            </button>
            {isMobile && (
              <button
                onClick={onCloseSidebar}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={12}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2.5 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 px-2">
            <HiSparkles className="mx-auto text-2xl text-gray-300 mb-3" />
            <p className="text-xs text-gray-500 font-medium">
              No conversations yet
            </p>
            <button
              onClick={onNewChat}
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              + Start a new chat
            </button>
          </div>
        ) : (
          Object.entries(groupedConversations).map(([label, convs]) => (
            <div key={label}>
              <p className="text-[11px] font-bold text-gray-400 uppercase px-3 py-2.5 tracking-wide">
                {label}
              </p>
              {convs.map((conv) => (
                <div
                  key={conv._id}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border-2 ${
                    activeConversation?._id === conv._id
                      ? 'bg-blue-50 border-dashed border-blue-300 shadow-sm'
                      : 'bg-white border-dashed border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                  }`}
                  onClick={() => {
                    onSelectConversation(conv);
                    if (isMobile) onCloseSidebar();
                  }}
                >
                  {/* Pin indicator */}
                  {conv.isPinned && (
                    <FaThumbtack
                      className="text-blue-500 flex-shrink-0 text-xs"
                      size={10}
                    />
                  )}

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    {editingId === conv._id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(conv._id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="flex-1 text-xs px-2 py-1 border-2 border-blue-300 rounded focus:outline-none focus:border-blue-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(conv._id);
                          }}
                          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        >
                          <FaCheck size={10} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {conv.title}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {conv.lastMessage?.content || 'No messages'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Menu button */}
                  {editingId !== conv._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(
                          menuOpenId === conv._id ? null : conv._id
                        );
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 rounded transition-opacity"
                    >
                      <FaEllipsisV size={10} />
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {menuOpenId === conv._id && (
                    <div className="absolute right-2 top-10 bg-white border-2 border-dashed border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(conv);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        <FaEdit size={10} />
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(conv._id);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        <FaThumbtack size={10} />
                        {conv.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv._id);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-all"
                      >
                        <FaTrash size={10} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
