import React from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const LocalVideo = ({
  videoRef,
  user,
  camOn,
  micOn,
  localStream,
  permissionError,
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
        {camOn && localStream && !permissionError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-cyan-700 text-white px-3 py-1 rounded-lg font-semibold text-sm shadow-lg">
              {user?.name || 'You'} (Me)
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-white">
            {permissionError ? (
              <div className="text-center p-6 bg-black/30 rounded-lg max-w-md">
                <p className="mb-2 font-semibold">⚠️ Permission Required</p>
                <p className="text-sm">{permissionError}</p>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-cyan-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl mb-3">
                  {getInitials(user?.name)}
                </div>
                <span className="text-lg font-semibold">
                  {user?.name || 'User'}
                </span>
                <span className="text-sm text-gray-400 mt-1">Camera Off</span>
              </>
            )}
          </div>
        )}

        {/* Mic indicator */}
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          {micOn ? (
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

export default LocalVideo;
