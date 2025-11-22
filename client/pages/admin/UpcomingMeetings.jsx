import React, { useState } from 'react';

const UpcomingMeetings = ({ meetings, navigate }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-center text-gray-500">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-semibold">No Upcoming Meetings</p>
          <p className="mt-2">Schedule a new meeting from the Create Meeting tab</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Upcoming Events ({meetings.length})
        </h2>
        
        {/* View Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-cyan-700 shadow-sm'
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
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-cyan-700 shadow-sm'
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
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map(m => (
            <div 
              key={m._id} 
              className="border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all bg-gradient-to-br from-white to-cyan-50 hover:scale-105"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {m.round}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  m.attended ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {m.attended ? '✓ Attended' : '⏳ Pending'}
                </span>
              </div>
              
              {/* Job Role */}
              <h3 className="font-bold text-xl text-gray-800 mb-4">{m.jobRole}</h3>
              
              {/* Details */}
              <div className="space-y-3 text-sm text-gray-700 mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-lg">👤</span>
                  <span className="font-medium">{m.user?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">✉️</span>
                  <span className="truncate text-gray-600">{m.user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📅</span>
                  <span>{new Date(m.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🕐</span>
                  <span className="font-semibold text-cyan-700">{m.time}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                  onClick={() => navigate(`/interview?meetingId=${m._id}&admin=1`)}
                >
                  Join Interview
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                  onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                  title="Update Meeting"
                >
                  ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meetings.map(m => (
                <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-700 font-bold text-lg">
                          {m.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{m.user?.name}</div>
                        <div className="text-sm text-gray-500">{m.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {new Date(m.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-cyan-600 font-bold">{m.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {m.jobRole}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-cyan-100 text-cyan-800">
                      {m.round}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                      m.attended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {m.attended ? '✓ Attended' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        className="text-white bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors font-semibold"
                        onClick={() => navigate(`/interview?meetingId=${m._id}&admin=1`)}
                      >
                        Join
                      </button>
                      <button
                        className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-semibold"
                        onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpcomingMeetings;