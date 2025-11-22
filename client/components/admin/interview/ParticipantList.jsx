import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ParticipantList = ({ participants, onClose }) => {
  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  return (
    <div className="absolute left-0 top-0 h-full w-80 bg-gray-800 border-r border-gray-700 shadow-2xl z-40 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">
          Participants ({participants.length})
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {participants.map((p, idx) => (
          <div
            key={p.socketId || idx}
            className="flex items-center gap-3 p-3 mb-2 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {getInitials(p.name)}
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">{p.name}</div>
              {p.stream && (
                <div className="text-green-400 text-xs flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Online
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;