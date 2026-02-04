import React from 'react';
import { FaUserFriends, FaTimes } from 'react-icons/fa';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const ParticipantsSidebar = ({
  participants,
  remoteStreams,
  user,
  onClose,
}) => {
  const { currentColors } = useTheme();

  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  return (
    <div 
      className="h-full w-80 shadow-2xl border-r"
      style={{ 
        background: `linear-gradient(180deg, ${currentColors.background}, ${currentColors.surface})`,
        borderColor: `${currentColors.primary}30`
      }}
    >
      {/* Header */}
      <div 
        className="flex justify-between items-center p-4 border-b"
        style={{ borderColor: `${currentColors.primary}30` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-white"
            style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}
          >
            <FaUserFriends />
          </div>
          <div>
            <span className="font-bold text-lg" style={{ color: currentColors.text }}>Participants</span>
            <p className="text-xs" style={{ color: currentColors.textMuted }}>{participants.length} in room</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
          style={{ color: currentColors.textMuted }}
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* Participants List */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        {participants.map((p, idx) => {
          const isConnected = remoteStreams[p.socketId] || p.id === user?.id;
          const isMe = p.id === user?.id;
          
          return (
            <div
              key={p.socketId || idx}
              className="flex items-center gap-3 p-3 rounded-xl transition-all border"
              style={{ 
                background: isMe 
                  ? `linear-gradient(135deg, ${currentColors.primary}20, ${currentColors.secondary}20)` 
                  : `${currentColors.text}05`,
                borderColor: isMe ? `${currentColors.primary}30` : 'transparent'
              }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ 
                  background: isMe 
                    ? `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`
                    : `linear-gradient(135deg, ${currentColors.secondary}, ${currentColors.primary})`
                }}
              >
                {p.photo ? (
                  <img src={p.photo} alt={p.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(p.name)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate flex items-center gap-2" style={{ color: currentColors.text }}>
                  {p.name}
                  {isMe && (
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ 
                        backgroundColor: `${currentColors.primary}30`,
                        color: currentColors.accent
                      }}
                    >
                      You
                    </span>
                  )}
                </div>
                <div className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: isConnected ? '#10b981' : currentColors.textMuted }}>
                  <HiOutlineStatusOnline size={12} />
                  {isMe ? 'Connected' : isConnected ? 'Connected' : 'Connecting...'}
                </div>
              </div>

              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: isConnected ? '#10b981' : currentColors.textMuted,
                  boxShadow: isConnected ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantsSidebar;
