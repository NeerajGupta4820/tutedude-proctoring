import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { HiOutlineRefresh } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const RemoteVideo = ({
  participant,
  remoteStream,
  connectionState,
  onRetry,
  remoteVideoRef,
}) => {
  const { currentColors } = useTheme();

  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  const getStatusInfo = () => {
    if (participant.isCamOn === false) {
      return { text: 'Camera is off', color: currentColors.textMuted };
    }
    if (connectionState === 'connected') {
      return { text: 'Waiting for stream...', color: '#f59e0b' };
    }
    if (connectionState === 'connecting' || connectionState === 'new' || !connectionState) {
      return { text: 'Connecting...', color: currentColors.accent };
    }
    if (connectionState === 'failed') {
      return { text: 'Connection Failed', color: '#ef4444' };
    }
    return { text: 'Disconnected', color: '#ef4444' };
  };

  const status = getStatusInfo();

  return (
    <div 
      className="rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border"
      style={{ 
        backgroundColor: currentColors.surface,
        borderColor: `${currentColors.secondary}30`,
        boxShadow: `0 25px 50px -12px ${currentColors.secondary}20`
      }}
    >
      <div 
        className="relative w-full h-full min-h-[300px] md:min-h-[400px] flex justify-center items-center"
        style={{ background: `linear-gradient(135deg, ${currentColors.surface}, ${currentColors.background})` }}
      >
        {remoteStream && participant.isCamOn !== false ? (
          <>
            <video
              ref={(el) => {
                if (el && el.srcObject !== remoteStream) {
                  el.srcObject = remoteStream;
                  if (remoteVideoRef) {
                    remoteVideoRef.current = el;
                  }
                }
              }}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div 
                className="backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${currentColors.secondary}e6, ${currentColors.primary}e6)` }}
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                {participant.name}
              </div>
            </div>

            <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Live
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center p-8">
            {participant.photo ? (
              <img 
                src={participant.photo} 
                alt={participant.name}
                className="w-28 h-28 rounded-full object-cover shadow-2xl mb-4 ring-4"
                style={{ 
                  boxShadow: `0 25px 50px -12px ${currentColors.secondary}50`,
                  borderColor: `${currentColors.secondary}50`
                }}
              />
            ) : (
              <div 
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl mb-4 text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${currentColors.secondary}, ${currentColors.primary})`,
                  boxShadow: `0 25px 50px -12px ${currentColors.secondary}50`
                }}
              >
                {getInitials(participant.name)}
              </div>
            )}
            <span className="text-xl font-semibold mb-1" style={{ color: currentColors.text }}>
              {participant.name}
            </span>
            <span className="text-sm flex items-center gap-2" style={{ color: status.color }}>
              <span 
                className={`w-2 h-2 rounded-full ${connectionState === 'connecting' || !connectionState ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: status.color }}
              ></span>
              {status.text}
            </span>
            
            {connectionState === 'failed' && (
              <button
                onClick={() => onRetry(participant.socketId)}
                className="mt-4 px-4 py-2 text-white text-sm rounded-xl font-medium transition-all shadow-lg flex items-center gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`,
                  boxShadow: `0 10px 30px ${currentColors.primary}40`
                }}
              >
                <HiOutlineRefresh size={16} />
                Retry Connection
              </button>
            )}
          </div>
        )}

        {/* Mic indicator */}
        <div className="absolute top-4 right-4 z-30">
          {participant.isMicOn !== false ? (
            <div 
              className="p-3 rounded-xl shadow-lg text-white"
              style={{ 
                background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`,
                boxShadow: `0 10px 30px ${currentColors.primary}40`
              }}
            >
              <FaMicrophone className="text-lg" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-lg shadow-red-500/30 text-white">
              <FaMicrophoneSlash className="text-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoteVideo;
