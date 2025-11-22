import React, { useState } from 'react';

const UpcomingMeetings = ({ meetings, navigate }) => {
  const [viewMode, setViewMode] = useState('list'); // Default 'list' view

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="text-center text-gray-600">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-semibold text-gray-900">No Upcoming Meetings</p>
          <p className="mt-2">Schedule a new meeting from the Create Meeting tab</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-700">
          Upcoming Meetings ({meetings.length})
        </h2>
        
        {/* View Toggle */}
        <div className="flex gap-2 bg-gray-200 p-1 rounded-lg shadow">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-cyan-700 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-cyan-700 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </span>
          </button>
        </div>
      </div>

      {/* List View (Default) */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {meetings.map(m => (
            <div 
              key={m._id} 
              className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left Section - User Info */}
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{m.user?.name}</div>
                      <div className="text-sm text-gray-600">{m.user?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Middle Section - Meeting Details */}
                <div className="flex-1 min-w-[300px] grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(m.scheduledDate || m.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Time</div>
                    <div className="font-semibold text-cyan-700">{m.startTime || m.time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Job Role</div>
                    <div className="font-semibold text-gray-900">{m.interviewConfig?.jobRole || m.jobRole}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Round</div>
                    <div className="font-semibold text-gray-900">{m.interviewConfig?.round || m.round}</div>
                  </div>
                </div>

                {/* Right Section - Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    m.attended ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {m.attended ? '✓ Attended' : '⏳ Pending'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      onClick={() => navigate(`/interview?meetingId=${m.roomId || m._id}&admin=1`)}
                    >
                      Join
                    </button>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                      onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                      title="Update Meeting"
                    >
                      ⚙️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map(m => (
            <div 
              key={m._id} 
              className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-cyan-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {m.interviewConfig?.round || m.round}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  m.attended ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {m.attended ? '✓ Attended' : '⏳ Pending'}
                </span>
              </div>
              
              {/* Job Role */}
              <h3 className="font-bold text-xl text-gray-900 mb-4">
                {m.interviewConfig?.jobRole || m.jobRole}
              </h3>
              
              {/* User Details */}
              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold">
                    {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{m.user?.name}</div>
                    <div className="text-gray-600 text-xs truncate">{m.user?.email}</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div>
                    <span className="font-semibold text-gray-600">Date: </span>
                    <span className="text-gray-900">
                      {new Date(m.scheduledDate || m.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Time: </span>
                    <span className="text-cyan-700 font-bold">{m.startTime || m.time}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  onClick={() => navigate(`/interview?meetingId=${m.roomId || m._id}&admin=1`)}
                >
                  Join Interview
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                  onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                  title="Update"
                >
                  ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingMeetings;