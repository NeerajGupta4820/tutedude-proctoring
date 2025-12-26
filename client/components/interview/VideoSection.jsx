import React from 'react';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';
import ParticipantsSidebar from './ParticipantsSidebar';

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
  onCloseParticipants,
  onRetryConnection,
}) => {
  const remoteParticipants = participants.filter((p) => p.id !== user?.id);

  return (
    <div className="flex-1 p-6 overflow-auto relative">
      <div
        className={`h-full grid ${
          remoteParticipants.length > 0 ? 'grid-cols-2' : 'grid-cols-1'
        } gap-6`}
      >
        {/* Local Video */}
        <LocalVideo
          videoRef={videoRef}
          user={user}
          camOn={camOn}
          micOn={micOn}
          localStream={localStream}
          permissionError={permissionError}
        />

        {/* Remote Participants */}
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
      {showParticipants && (
        <ParticipantsSidebar
          participants={participants}
          remoteStreams={remoteStreams}
          user={user}
          onClose={onCloseParticipants}
        />
      )}
    </div>
  );
};

export default VideoSection;
