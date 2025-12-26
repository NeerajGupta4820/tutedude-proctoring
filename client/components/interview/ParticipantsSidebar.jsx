import React from 'react';
import { FaUserFriends } from 'react-icons/fa';

const ParticipantsSidebar = ({
  participants,
  remoteStreams,
  user,
  onClose,
}) => {
  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  return (
    <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl z-20">
      <div className="flex justify-between items-center p-4 bg-cyan-700 text-white">
        <span className="font-bold text-lg flex items-center gap-2">
          <FaUserFriends />
          Participants ({participants.length})
        </span>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-2"
        >
          ✕
        </button>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        {participants.map((p, idx) => (
          <div
            key={p.socketId || idx}
            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
          >
            <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
              {getInitials(p.name)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">
                {p.name} {p.id === user?.id && '(You)'}
              </div>
              <div
                className={`text-xs flex items-center gap-1 ${
                  remoteStreams[p.socketId] || p.id === user?.id
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    remoteStreams[p.socketId] || p.id === user?.id
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                ></span>
                {p.id === user?.id
                  ? 'You'
                  : remoteStreams[p.socketId]
                    ? 'Connected'
                    : 'Connecting...'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsSidebar;
