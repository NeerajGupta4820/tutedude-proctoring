// components/tools/ToolsBar.jsx
import React from 'react';
import {
  FaCode,
  FaQuestionCircle,
  FaComments,
  FaPaintBrush,
  FaUser,
  FaFileAlt,
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const ToolsBar = ({
  activePanel,
  setActivePanel,
  meetingData,
  user,
  questionVisibleToCandidate = false,
}) => {
  const { currentColors } = useTheme();
  const isAdmin = user?.role === 'admin';
  const isCandidate = user?.role === 'candidate';

  const allTools = [
    {
      id: 'chat',
      icon: FaComments,
      label: 'Chat',
      enabled: meetingData?.enabledTools?.chat?.enabled ?? true,
      adminOnly: false,
      candidateVisible: true,
    },
    {
      id: 'whiteboard',
      icon: FaPaintBrush,
      label: 'Whiteboard',
      enabled: meetingData?.enabledTools?.whiteboard?.enabled ?? true,
      adminOnly: false,
      candidateVisible: true,
    },
    {
      id: 'question',
      icon: FaQuestionCircle,
      label: 'DSA Questions',
      enabled: true,
      adminOnly: false,
      candidateVisible: questionVisibleToCandidate,
    },
    {
      id: 'code',
      icon: FaCode,
      label: 'Code Editor',
      enabled: meetingData?.enabledTools?.codeEditor?.enabled ?? true,
      adminOnly: true,
      candidateVisible: false,
    },
    {
      id: 'profile',
      icon: FaUser,
      label: 'Candidate Profile',
      enabled: true,
      adminOnly: true,
      candidateVisible: false,
    },
    {
      id: 'resume',
      icon: FaFileAlt,
      label: 'Resume',
      enabled: true,
      adminOnly: false,
      candidateVisible: true,
    },
  ];

  const tools = allTools.filter((tool) => {
    if (!tool.enabled) return false;
    if (isAdmin) return true;
    if (isCandidate) {
      if (tool.adminOnly) return false;
      return tool.candidateVisible;
    }
    return !tool.adminOnly;
  });

  return (
    <div 
      className="flex flex-col gap-3 p-3 border-l"
      style={{ 
        width: '80px',
        backgroundColor: `${currentColors.surface}80`,
        borderColor: `${currentColors.primary}30`
      }}
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activePanel === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => setActivePanel(isActive ? null : tool.id)}
            className="group relative p-3 rounded-xl transition-all duration-300"
            style={{
              background: isActive 
                ? `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`
                : `${currentColors.surface}80`,
              color: isActive ? '#ffffff' : currentColors.textMuted,
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isActive ? `0 10px 30px ${currentColors.primary}40` : 'none'
            }}
            title={tool.label}
          >
            <Icon size={22} className="mx-auto" />

            {/* Tooltip */}
            <span
              className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 border text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 ${isActive ? 'hidden' : ''}`}
              style={{ 
                backgroundColor: currentColors.background,
                borderColor: `${currentColors.primary}30`,
                color: currentColors.text
              }}
            >
              {tool.label}
            </span>

            {/* Active Indicator */}
            {isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ToolsBar;
