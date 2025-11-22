import React from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaUserFriends,
  FaSignOutAlt,
  FaCircle,
} from 'react-icons/fa';

const ControlPanel = ({
  micOn,
  camOn,
  recording,
  onToggleMic,
  onToggleCamera,
  onToggleRecording,
  onToggleParticipants,
  onLeave,
}) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
      <div className="flex items-center justify-center gap-4">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`p-4 rounded-full transition-all ${
            micOn
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={micOn ? 'Mute' : 'Unmute'}
        >
          {micOn ? <FaMicrophone className="text-xl" /> : <FaMicrophoneSlash className="text-xl" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-4 rounded-full transition-all ${
            camOn
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={camOn ? 'Stop Video' : 'Start Video'}
        >
          {camOn ? <FaVideo className="text-xl" /> : <FaVideoSlash className="text-xl" />}
        </button>

        {/* Recording Toggle */}
        <button
          onClick={onToggleRecording}
          className={`p-4 rounded-full transition-all ${
            recording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={recording ? 'Stop Recording' : 'Start Recording'}
        >
          <FaCircle className={`text-xl ${recording ? 'animate-pulse' : ''}`} />
        </button>

        {/* Participants */}
        <button
          onClick={onToggleParticipants}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
          title="Participants"
        >
          <FaUserFriends className="text-xl" />
        </button>

        {/* Leave */}
        <button
          onClick={onLeave}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all ml-4"
          title="Leave Interview"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;