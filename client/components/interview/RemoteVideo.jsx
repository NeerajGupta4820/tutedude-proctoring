import React from 'react';

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
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="bg-cyan-700 text-white px-3 py-1 rounded-lg font-semibold text-sm shadow-lg flex items-center gap-2">
                {participant.name}
                <span className={`text-xs ${participant.isMicOn ? 'text-green-400' : 'text-red-400'}`}>
                  {participant.isMicOn ? '🎤' : '🔇'}
                </span>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-green-500 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Live
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-white">
            <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl mb-3 relative">
              {getInitials(participant.name)}
              <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-gray-900 ${participant.isMicOn ? 'bg-green-500' : 'bg-red-500'}`}>
                <span className="text-[10px] leading-none">
                  {participant.isMicOn ? '🎤' : '🔇'}
                </span>
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default RemoteVideo;
