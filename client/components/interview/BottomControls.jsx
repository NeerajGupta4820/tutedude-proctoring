import React from 'react';
import {
  FaThLarge,
  FaUserFriends,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaSignOutAlt,
  FaSync,
} from 'react-icons/fa';

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
  return (
    <div className="bg-white border-t border-gray-300 shadow-lg flex-shrink-0">
      <div className="flex items-center justify-center gap-3 px-6 py-2">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`p-4 rounded-lg font-semibold transition-all shadow-md hover:scale-105 ${
            micOn
              ? 'bg-cyan-700 text-white hover:bg-cyan-800'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={micOn ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-4 rounded-lg font-semibold transition-all shadow-md hover:scale-105 ${
            camOn
              ? 'bg-cyan-700 text-white hover:bg-cyan-800'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {camOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
        </button>

        {/* Layout Toggle */}
        <button
          onClick={onToggleLayout}
          className="p-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md hover:scale-105"
          title="Switch Layout"
        >
          <FaThLarge size={20} />
        </button>

        {/* Participants Toggle */}
        <button
          onClick={onToggleParticipants}
          className="p-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md hover:scale-105 relative"
          title="Show Participants"
        >
          <FaUserFriends size={20} />
          {participantsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-cyan-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {participantsCount}
            </span>
          )}
        </button>

        {/* Reconnect Button */}
        <button
          onClick={onReconnect}
          disabled={isReconnecting}
          className={`p-4 rounded-lg transition-all shadow-md hover:scale-105 ${
            isReconnecting
              ? 'bg-yellow-500 text-white cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          title="Reconnect"
        >
          <FaSync size={20} className={isReconnecting ? 'animate-spin' : ''} />
        </button>

        <div className="h-8 w-px bg-gray-300 mx-2"></div>

        {/* Leave Button */}
        <button
          onClick={onLeave}
          className="px-6 py-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md hover:scale-105 flex items-center gap-2"
          title="Leave Interview"
        >
          <FaSignOutAlt size={20} />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
};

export default BottomControls;
