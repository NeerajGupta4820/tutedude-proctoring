import React from 'react';
import { FaClock, FaWifi } from 'react-icons/fa';

const InterviewHeader = ({
  meetingData,
  candidateData,
  user,
  timer,
  isConnected,
  isReconnecting,
}) => {
  return (
    <div className="bg-cyan-700 text-white px-6 py-3 shadow-lg flex-shrink-0">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Interview Room</h1>

          {meetingData && (
            <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
              {meetingData.interviewConfig?.jobRole || 'Technical Interview'}
            </span>
          )}

          {candidateData && user?.role === 'admin' && (
            <span className="text-sm bg-white/10 px-3 py-1 rounded-lg">
              Candidate: {candidateData.name}
            </span>
          )}

          {/* Connection Status */}
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              isConnected
                ? 'bg-green-500'
                : isReconnecting
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          >
            <FaWifi size={10} />
            <span>
              {isConnected
                ? 'Connected'
                : isReconnecting
                  ? 'Reconnecting...'
                  : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
            <FaClock />
            <span className="font-mono font-semibold">{timer}</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">{user?.name}</span>
            {user?.role === 'admin' && (
              <span className="text-xs ml-2 bg-white/20 px-2 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewHeader;
