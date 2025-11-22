import React from 'react';

const AllMeetings = ({ meetings, navigate }) => {
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="text-center text-gray-600">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl font-semibold text-gray-900">No Meetings Found</p>
          <p className="mt-2">Create your first meeting to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-700">
          All Meetings ({meetings.length})
        </h2>
        <p className="text-gray-600 mt-1">Complete list of all scheduled interviews</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
          <p className="text-sm text-gray-600 font-semibold mb-1">Total Meetings</p>
          <p className="text-3xl font-bold text-cyan-700">{meetings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
          <p className="text-sm text-gray-600 font-semibold mb-1">Attended</p>
          <p className="text-3xl font-bold text-cyan-700">
            {meetings.filter(m => m.attended).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
          <p className="text-sm text-gray-600 font-semibold mb-1">Pending</p>
          <p className="text-3xl font-bold text-cyan-700">
            {meetings.filter(m => !m.attended).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
          <p className="text-sm text-gray-600 font-semibold mb-1">Pass Rate</p>
          <p className="text-3xl font-bold text-cyan-700">
            {meetings.filter(m => m.attended).length > 0 
              ? Math.round((meetings.filter(m => m.result === 'pass').length / meetings.filter(m => m.attended).length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Meetings List */}
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
              <div className="flex-1 min-w-[400px] grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Date & Time</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(m.scheduledDate || m.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm font-semibold text-cyan-700">{m.startTime || m.time}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Job Role</div>
                  <div className="font-semibold text-gray-900">{m.interviewConfig?.jobRole || m.jobRole}</div>
                  <div className="text-sm text-gray-600">Round: {m.interviewConfig?.round || m.round}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    m.attended ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {m.attended ? '✓ Attended' : '⏳ Pending'}
                  </span>
                  {m.rating && (
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      ★ {m.rating}/10
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section - Result & Actions */}
              <div className="flex flex-col items-end gap-3">
                {m.result && m.result !== 'pending' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    m.result === 'pass' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {m.result === 'pass' ? '✓ PASS' : '✗ FAIL'}
                  </span>
                )}
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
    </div>
  );
};

export default AllMeetings;