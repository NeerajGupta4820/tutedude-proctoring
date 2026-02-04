import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const RemoteVideo = ({
  participant,
  remoteStream,
  connectionState,
  onRetry,
  remoteVideoRef,
}) => {
  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative w-full h-full min-h-[400px] bg-gray-900 flex justify-center items-center">
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
            {/* Name tag at bottom left */}
            <div className="absolute bottom-3 left-3 bg-cyan-700 text-white px-3 py-1 rounded-lg font-semibold text-sm shadow-lg">
              {participant.name}
            </div>
            {/* Live indicator at top left */}
            <div className="absolute top-3 left-3 bg-green-500 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Live
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-white">
            {/* Profile image or initials */}
            {participant.photo ? (
              <img 
                src={participant.photo} 
                alt={participant.name}
                className="w-24 h-24 rounded-full object-cover shadow-xl mb-3"
              />
            ) : (
              <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl mb-3">
                {getInitials(participant.name)}
              </div>
            )}
            <span className="text-lg font-semibold">{participant.name}</span>
            <span className="text-sm text-gray-400 mt-1">
              {participant.isCamOn === false 
                ? 'Camera is off' 
                : connectionState === 'connected'
                  ? 'Waiting for stream...'
                  : connectionState === 'connecting' || connectionState === 'new' || !connectionState
                    ? 'Connecting...'
                    : connectionState === 'failed'
                      ? 'Connection Failed'
                      : connectionState === 'disconnected' || connectionState === 'closed'
                        ? 'Disconnected'
                        : 'Connecting...'}
            </span>
            {connectionState === 'failed' && (
              <button
                onClick={() => onRetry(participant.socketId)}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Mic indicator - top right corner (same as LocalVideo) */}
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          {participant.isMicOn !== false ? (
            <div className="bg-cyan-700 p-2 rounded-full shadow-lg">
              <FaMicrophone className="text-white text-lg" />
            </div>
          ) : (
            <div className="bg-red-600 p-2 rounded-full shadow-lg">
              <FaMicrophoneSlash className="text-white text-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoteVideo;
