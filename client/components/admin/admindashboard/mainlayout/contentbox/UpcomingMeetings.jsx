import React, { useState } from 'react';
import { FaThLarge, FaList, FaSortAmountDown, FaCalendarAlt, FaBriefcase, FaClock } from 'react-icons/fa';

const UpcomingMeetings = ({ meetings, navigate }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('date-asc'); // sorting option

  // Sorting function
  const getSortedMeetings = () => {
    let sorted = [...meetings];
    
    switch(sortBy) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.scheduledDate || a.date) - new Date(b.scheduledDate || b.date));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.scheduledDate || b.date) - new Date(a.scheduledDate || a.date));
      case 'name-asc':
        return sorted.sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
      case 'name-desc':
        return sorted.sort((a, b) => (b.user?.name || '').localeCompare(a.user?.name || ''));
      case 'time-asc':
        return sorted.sort((a, b) => (a.startTime || a.time || '').localeCompare(b.startTime || b.time || ''));
      case 'time-desc':
        return sorted.sort((a, b) => (b.startTime || b.time || '').localeCompare(a.startTime || a.time || ''));
      default:
        return sorted;
    }
  };

  const sortedMeetings = getSortedMeetings();

  // Calculate time until meeting
  const getTimeUntilMeeting = (meeting) => {
    const meetingDate = new Date(meeting.scheduledDate || meeting.date);
    const now = new Date();
    const diff = meetingDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return `In ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
  };

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-600">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-semibold text-gray-900">No Upcoming Meetings</p>
          <p className="mt-2 text-sm">Schedule a new meeting from the Create Meeting tab</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const todayMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduledDate || m.date);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  });

  const thisWeekMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduledDate || m.date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return meetingDate >= today && meetingDate <= weekFromNow;
  });

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Total Upcoming</p>
          <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Today</p>
          <p className="text-2xl font-bold text-cyan-600">{todayMeetings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">This Week</p>
          <p className="text-2xl font-bold text-blue-600">{thisWeekMeetings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {meetings.filter(m => !m.attended).length}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left - Title */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Meetings
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">Showing {sortedMeetings.length} scheduled interviews</p>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <FaSortAmountDown className="text-gray-400 text-sm" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white"
              >
                <option value="date-asc">Soonest First</option>
                <option value="date-desc">Latest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="time-asc">Time (Early-Late)</option>
                <option value="time-desc">Time (Late-Early)</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-cyan-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
                title="List View"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-cyan-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
                title="Grid View"
              >
                <FaThLarge />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedMeetings.map(m => (
            <div 
              key={m._id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Section - User Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-cyan-700 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-sm truncate">{m.user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{m.user?.email}</div>
                  </div>
                </div>

                {/* Middle Section - Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      Date
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {new Date(m.scheduledDate || m.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-cyan-600 font-medium">{getTimeUntilMeeting(m)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FaClock className="text-gray-400" />
                      Time
                    </div>
                    <div className="font-medium text-gray-900 text-sm">{m.startTime || m.time}</div>
                    <div className="text-xs text-gray-600">{m.duration || 60} min</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FaBriefcase className="text-gray-400" />
                      Role
                    </div>
                    <div className="font-medium text-gray-900 text-sm truncate">{m.interviewConfig?.jobRole || m.jobRole}</div>
                    <div className="text-xs text-gray-600 truncate">{m.interviewConfig?.round || m.round}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Status</div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.attended ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {m.attended ? 'Attended' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    className="bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    onClick={() => navigate(`/interview?meetingId=${m.roomId || m._id}&admin=1`)}
                  >
                    Join
                  </button>
                  <button
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm border border-gray-200 transition-colors"
                    onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                    title="Update Meeting"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedMeetings.map(m => (
            <div 
              key={m._id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm truncate">{m.user?.name}</div>
                  <div className="text-xs text-gray-500 truncate">{m.user?.email}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                  m.attended ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {m.attended ? 'Done' : 'Pending'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400 text-sm flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Date & Time</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {new Date(m.scheduledDate || m.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })} • {m.startTime || m.time}
                    </div>
                    <div className="text-xs text-cyan-600 font-medium">{getTimeUntilMeeting(m)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaBriefcase className="text-gray-400 text-sm flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Position</div>
                    <div className="font-medium text-gray-900 text-sm truncate">{m.interviewConfig?.jobRole || m.jobRole}</div>
                    <div className="text-xs text-gray-600 truncate">{m.interviewConfig?.round || m.round}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-400 text-sm flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-medium text-gray-900 text-sm">{m.duration || 60} minutes</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  className="flex-1 bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  onClick={() => navigate(`/interview?meetingId=${m.roomId || m._id}&admin=1`)}
                >
                  Join
                </button>
                <button
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm border border-gray-200 transition-colors"
                  onClick={() => navigate(`/admin-end-meeting/${m._id}`)}
                  title="Settings"
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