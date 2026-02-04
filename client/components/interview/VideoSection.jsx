import React from 'react';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';
import ParticipantsSidebar from './ParticipantsSidebar';
import { useTheme } from '../../context/ThemeContext';

const VideoSection = ({
  videoRef,
  user,
  camOn,
  micOn,
  localStream,
  permissionError,
  participants,
  remoteStreams,
  connectionStates,
  remoteVideoRefs,
  showParticipants,
  socket,
  onCloseParticipants,
  onRetryConnection,
}) => {
  const { currentColors } = useTheme();
  const remoteParticipants = participants.filter((p) => p.socketId !== socket?.id);
  const totalVideos = 1 + remoteParticipants.length;

  const getGridClass = () => {
    if (totalVideos === 1) return 'grid-cols-1';
    if (totalVideos === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalVideos <= 4) return 'grid-cols-2';
    if (totalVideos <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div 
      className="flex-1 p-4 md:p-6 overflow-auto relative"
      style={{ backgroundColor: currentColors.background }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: currentColors.primary }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: currentColors.secondary }}
        ></div>
      </div>

      {/* Video Grid */}
      <div className={`relative h-full grid ${getGridClass()} gap-4 md:gap-6 auto-rows-fr`}>
        <LocalVideo
          videoRef={videoRef}
          user={user}
          camOn={camOn}
          micOn={micOn}
          localStream={localStream}
          permissionError={permissionError}
        />

        {remoteParticipants.map((p) => (
          <RemoteVideo
            key={p.socketId}
            participant={p}
            remoteStream={remoteStreams[p.socketId]}
            connectionState={connectionStates[p.socketId]}
            onRetry={onRetryConnection}
            remoteVideoRef={{ current: remoteVideoRefs.current[p.socketId] }}
          />
        ))}
      </div>

      {/* Participants Sidebar */}
      <div className={`absolute left-0 top-0 h-full z-20 transition-transform duration-300 ease-out ${showParticipants ? 'translate-x-0' : '-translate-x-full'}`}>
        {showParticipants && (
          <ParticipantsSidebar
            participants={participants}
            remoteStreams={remoteStreams}
            user={user}
            onClose={onCloseParticipants}
          />
        )}
      </div>

      {showParticipants && (
        <div 
          className="absolute inset-0 backdrop-blur-sm z-10 md:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={onCloseParticipants}
        ></div>
      )}
    </div>
  );
};

export default VideoSection;
