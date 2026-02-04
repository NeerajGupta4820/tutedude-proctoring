import React from 'react';
import {
  FaThLarge,
  FaUserFriends,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaSignOutAlt,
} from 'react-icons/fa';
import { HiOutlineRefresh } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const BottomControls = ({
  micOn,
  camOn,
  layout,
  isReconnecting,
  participantsCount,
  onToggleMic,
  onToggleCamera,
  onToggleLayout,
  onToggleParticipants,
  onReconnect,
  onLeave,
}) => {
  const { currentColors } = useTheme();

  const ControlButton = ({ onClick, active, danger, children, title, badge, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="relative p-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      style={{
        background: active 
          ? `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`
          : danger 
            ? 'linear-gradient(135deg, #ef4444, #f43f5e)'
            : currentColors.surface,
        color: active || danger ? '#ffffff' : currentColors.textMuted,
        boxShadow: active ? `0 10px 30px ${currentColors.primary}40` : undefined,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
      {badge && (
        <span 
          className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
          style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}
        >
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div 
      className="border-t shadow-2xl flex-shrink-0"
      style={{ 
        background: `linear-gradient(to right, ${currentColors.background}, ${currentColors.surface}, ${currentColors.background})`,
        borderColor: `${currentColors.primary}30`
      }}
    >
      <div className="flex items-center justify-center gap-4 px-6 py-4">
        {/* Mic Toggle */}
        <ControlButton
          onClick={onToggleMic}
          active={micOn}
          title={micOn ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
        </ControlButton>

        {/* Camera Toggle */}
        <ControlButton
          onClick={onToggleCamera}
          active={camOn}
          title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {camOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
        </ControlButton>

        {/* Divider */}
        <div className="h-10 w-px" style={{ backgroundColor: currentColors.textMuted + '40' }}></div>

        {/* Layout Toggle */}
        <ControlButton onClick={onToggleLayout} title="Switch Layout">
          <FaThLarge size={20} />
        </ControlButton>

        {/* Participants Toggle */}
        <ControlButton
          onClick={onToggleParticipants}
          title="Show Participants"
          badge={participantsCount > 0 ? participantsCount : null}
        >
          <FaUserFriends size={20} />
        </ControlButton>

        {/* Reconnect Button */}
        <ControlButton
          onClick={onReconnect}
          disabled={isReconnecting}
          title="Reconnect"
          active={isReconnecting}
        >
          <HiOutlineRefresh size={20} className={isReconnecting ? 'animate-spin' : ''} />
        </ControlButton>

        {/* Divider */}
        <div className="h-10 w-px" style={{ backgroundColor: currentColors.textMuted + '40' }}></div>

        {/* Leave Button */}
        <button
          onClick={onLeave}
          className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 text-white"
          style={{ 
            background: 'linear-gradient(135deg, #ef4444, #f43f5e)',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
          }}
          title="Leave Interview"
        >
          <FaSignOutAlt size={18} />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
};

export default BottomControls;
