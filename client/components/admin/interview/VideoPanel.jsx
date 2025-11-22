import React, { useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const VideoPanel = ({ 
  user, 
  participants, 
  mediaStream, 
  micOn, 
  camOn, 
  permissionError,
  recording,
  showToolsPanel 
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.split(' ');
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0][0].toUpperCase();
  };

  const gridClass = participants.length > 1 
    ? 'grid-cols-2' 
    : 'grid-cols-1';

  return (
    <div className={`flex-1 p-4 transition-all duration-300 ${showToolsPanel ? 'mr-96' : ''}`}>
      <div className={`grid ${gridClass} gap-4 h-full`}>
        {/* Local Video */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-800 border-2 border-gray-700">
          {camOn && !permissionError ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm font-semibold">
                {user?.name || 'You'} (You)
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {permissionError ? (
                <div className="text-center text-white p-6">
                  <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-semibold mb-2">{permissionError}</p>
                  <p className="text-sm text-gray-400">Check browser settings to allow camera access</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-white">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-lg font-semibold">{user?.name || 'You'}</span>
                  <span className="text-sm text-gray-400 mt-1">Camera Off</span>
                </div>
              )}
            </div>
          )}
          
          {/* Mic Indicator */}
          <div className="absolute top-4 right-4">
            <div className={`p-2 rounded-full ${micOn ? 'bg-green-600' : 'bg-red-600'}`}>
              {micOn ? (
                <FaMicrophone className="text-white text-lg" />
              ) : (
                <FaMicrophoneSlash className="text-white text-lg" />
              )}
            </div>
          </div>

          {/* Recording Indicator */}
          {recording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-semibold">REC</span>
            </div>
          )}
        </div>

        {/* Remote Participants */}
        {participants
          .filter(p => p.id !== user?.id)
          .map(p => (
            <div key={p.socketId} className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-800 border-2 border-gray-700">
              {p.stream ? (
                <>
                  <video
                    ref={p.videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm font-semibold">
                    {p.name}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex flex-col items-center text-white">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                      {getInitials(p.name)}
                    </div>
                    <span className="text-lg font-semibold">{p.name}</span>
                    <span className="text-sm text-gray-400 mt-1">Connecting...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default VideoPanel;