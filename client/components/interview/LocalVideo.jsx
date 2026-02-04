import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const LocalVideo = ({
  videoRef,
  user,
  camOn,
  micOn,
  localStream,
  permissionError,
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
      className="rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border"
      style={{ 
        backgroundColor: currentColors.surface,
        borderColor: `${currentColors.primary}30`,
        boxShadow: `0 25px 50px -12px ${currentColors.primary}20`
      }}
    >
      <div 
        className="relative w-full h-full min-h-[300px] md:min-h-[400px] flex justify-center items-center"
        style={{ background: `linear-gradient(135deg, ${currentColors.surface}, ${currentColors.background})` }}
      >
        {camOn && localStream && !permissionError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div 
                className="backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${currentColors.primary}e6, ${currentColors.secondary}e6)` }}
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                {user?.name || 'You'} (Me)
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center p-8">
            {permissionError ? (
              <div className="text-center p-6 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-md">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="mb-2 font-semibold text-red-400">Permission Required</p>
                <p className="text-sm" style={{ color: currentColors.textMuted }}>{permissionError}</p>
              </div>
            ) : (
              <>
                <div 
                  className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl mb-4 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`,
                    boxShadow: `0 25px 50px -12px ${currentColors.primary}50`
                  }}
                >
                  {getInitials(user?.name)}
                </div>
                <span className="text-xl font-semibold mb-1" style={{ color: currentColors.text }}>
                  {user?.name || 'User'}
                </span>
                <span className="text-sm flex items-center gap-2" style={{ color: currentColors.textMuted }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentColors.textMuted }}></span>
                  Camera Off
                </span>
              </>
            )}
          </div>
        )}

        {/* Mic indicator */}
        <div className="absolute top-4 right-4 z-30">
          {micOn ? (
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

        {/* "You" badge */}
        <div 
          className="absolute top-4 left-4 backdrop-blur-sm border px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: `${currentColors.text}10`,
            borderColor: `${currentColors.text}20`,
            color: currentColors.text
          }}
        >
          You
        </div>
      </div>
    </div>
  );
};

export default LocalVideo;
