import React from 'react';
import {
  FaCode,
  FaQuestionCircle,
  FaComments,
  FaPaintBrush,
  FaUser,
  FaFileAlt,
} from 'react-icons/fa';

const ToolsBar = ({ activePanel, setActivePanel, meetingData, user }) => {
  const allTools = [
    {
      id: 'chat',
      icon: FaComments,
      label: 'Chat',
      enabled: meetingData?.enabledTools?.chat?.enabled ?? true,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      adminOnly: false,
    },
    {
      id: 'whiteboard',
      icon: FaPaintBrush,
      label: 'Whiteboard',
      enabled: meetingData?.enabledTools?.whiteboard?.enabled ?? true,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      adminOnly: false,
    },
    {
      id: 'question',
      icon: FaQuestionCircle,
      label: 'DSA Questions',
      enabled: true,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      adminOnly: true,
    },
    {
      id: 'code',
      icon: FaCode,
      label: 'Code Editor',
      enabled: meetingData?.enabledTools?.codeEditor?.enabled ?? true,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      adminOnly: true,
    },
    {
      id: 'profile',
      icon: FaUser,
      label: 'Candidate Profile',
      enabled: true,
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
      adminOnly: true,
    },
    {
      id: 'resume',
      icon: FaFileAlt,
      label: 'Resume',
      enabled: true,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      adminOnly: false,
    },
  ];

  // Filter tools based on user role
  const tools = allTools.filter((tool) => {
    if (!tool.enabled) return false;
    if (tool.adminOnly && user?.role !== 'admin') return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-3 px-2" style={{ width: '80px' }}>
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activePanel === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => setActivePanel(isActive ? null : tool.id)}
            className={`group relative p-4 rounded-lg shadow-lg transition-all duration-300 ${
              isActive
                ? `bg-gradient-to-r ${tool.color} text-white scale-110 shadow-xl`
                : `bg-white text-gray-700 hover:scale-105 ${tool.hoverColor}`
            }`}
            title={tool.label}
          >
            <Icon size={24} />

            {/* Tooltip */}
            <span
              className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${isActive ? 'hidden' : ''}`}
            >
              {tool.label}
              <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
            </span>

            {/* Active Indicator */}
            {isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ToolsBar;
