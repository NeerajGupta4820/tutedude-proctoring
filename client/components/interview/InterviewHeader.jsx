import React from 'react';
import { FaClock, FaCircle } from 'react-icons/fa';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const InterviewHeader = ({
  meetingData,
  candidateData,
  user,
  timer,
  isConnected,
  isReconnecting,
}) => {
  const { currentColors } = useTheme();

  return (
    <div 
      className="text-white px-6 py-4 shadow-2xl flex-shrink-0 border-b"
      style={{ 
        background: `linear-gradient(to right, ${currentColors.background}, ${currentColors.surface}, ${currentColors.background})`,
        borderColor: `${currentColors.primary}30`
      }}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}
            >
              <span className="text-lg font-bold">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: currentColors.text }}>
                Interview Room
              </h1>
              <p className="text-xs" style={{ color: currentColors.textMuted }}>TuteDude Proctoring</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px" style={{ backgroundColor: currentColors.textMuted + '40' }}></div>

          {/* Job Role Tag */}
          {meetingData && (
            <div 
              className="flex items-center gap-2 backdrop-blur-sm border px-4 py-1.5 rounded-full"
              style={{ 
                background: `${currentColors.primary}20`,
                borderColor: `${currentColors.primary}30`
              }}
            >
              <FaCircle style={{ color: currentColors.accent }} className="text-[6px]" />
              <span className="text-sm font-medium" style={{ color: currentColors.text }}>
                {meetingData.interviewConfig?.jobRole || 'Technical Interview'}
              </span>
            </div>
          )}

          {/* Candidate Info for Admin */}
          {candidateData && user?.role === 'admin' && (
            <div 
              className="flex items-center gap-2 backdrop-blur-sm border px-4 py-1.5 rounded-full"
              style={{ backgroundColor: `${currentColors.text}08`, borderColor: `${currentColors.text}15` }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${currentColors.secondary}, ${currentColors.primary})` }}
              >
                {candidateData.name?.charAt(0) || 'C'}
              </div>
              <span className="text-sm" style={{ color: currentColors.textMuted }}>{candidateData.name}</span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border"
            style={{ 
              backgroundColor: isConnected ? '#10b98120' : isReconnecting ? '#f59e0b20' : '#ef444420',
              color: isConnected ? '#10b981' : isReconnecting ? '#f59e0b' : '#ef4444',
              borderColor: isConnected ? '#10b98130' : isReconnecting ? '#f59e0b30' : '#ef444430'
            }}
          >
            <HiOutlineStatusOnline size={14} />
            <span>
              {isConnected
                ? 'Connected'
                : isReconnecting
                  ? 'Reconnecting...'
                  : 'Disconnected'}
            </span>
          </div>

          {/* Timer */}
          <div 
            className="flex items-center gap-2 backdrop-blur-sm border px-4 py-2 rounded-xl"
            style={{ 
              backgroundColor: `${currentColors.text}08`,
              borderColor: `${currentColors.text}15`
            }}
          >
            <FaClock style={{ color: currentColors.accent }} />
            <span className="font-mono font-bold text-lg tracking-wider" style={{ color: currentColors.text }}>
              {timer}
            </span>
          </div>

          {/* User Info */}
          <div 
            className="flex items-center gap-3 backdrop-blur-sm border px-4 py-2 rounded-xl"
            style={{ 
              backgroundColor: `${currentColors.text}08`,
              borderColor: `${currentColors.text}15`
            }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg text-white"
              style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold" style={{ color: currentColors.text }}>{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: currentColors.accent }}>
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewHeader;
