import React, { useState, useMemo } from 'react';
import {
  FaThLarge,
  FaList,
  FaSortAmountDown,
  FaCalendarAlt,
  FaBriefcase,
  FaClock,
  FaVideo,
  FaCog,
  FaCalendarCheck,
  FaHourglassHalf,
  FaCalendarDay,
  FaCalendarWeek,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';

// ✅ MOVED OUTSIDE - Sort options
const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Soonest First' },
  { value: 'date-desc', label: 'Latest First' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'time-asc', label: 'Time (Early-Late)' },
  { value: 'time-desc', label: 'Time (Late-Early)' },
];

// ✅ MOVED OUTSIDE - Helper function to get time until meeting
const getTimeUntilMeeting = (meeting) => {
  const meetingDate = new Date(meeting.scheduledDate || meeting.date);
  const now = new Date();
  const diff = meetingDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return { text: 'Today', color: 'text-green-600 bg-green-50' };
  if (days === 1)
    return { text: 'Tomorrow', color: 'text-blue-600 bg-blue-50' };
  if (days < 7)
    return { text: `In ${days} days`, color: 'text-yellow-600 bg-yellow-50' };
  return {
    text: `In ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`,
    color: 'text-gray-600 bg-gray-50',
  };
};

// ✅ MOVED OUTSIDE - Helper function to sort meetings
const sortMeetings = (meetings, sortBy) => {
  const sorted = [...meetings];
  switch (sortBy) {
    case 'date-asc':
      return sorted.sort(
        (a, b) =>
          new Date(a.scheduledDate || a.date) -
          new Date(b.scheduledDate || b.date)
      );
    case 'date-desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.scheduledDate || b.date) -
          new Date(a.scheduledDate || a.date)
      );
    case 'name-asc':
      return sorted.sort((a, b) =>
        (a.user?.name || '').localeCompare(b.user?.name || '')
      );
    case 'name-desc':
      return sorted.sort((a, b) =>
        (b.user?.name || '').localeCompare(a.user?.name || '')
      );
    case 'time-asc':
      return sorted.sort((a, b) =>
        (a.startTime || a.time || '').localeCompare(b.startTime || b.time || '')
      );
    case 'time-desc':
      return sorted.sort((a, b) =>
        (b.startTime || b.time || '').localeCompare(a.startTime || a.time || '')
      );
    default:
      return sorted;
  }
};

// ✅ MOVED OUTSIDE - Helper function to filter meetings by search
const filterMeetings = (meetings, searchQuery) => {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return meetings;

  return meetings.filter((m) => {
    const userName = m.user?.name?.toLowerCase() || '';
    const userEmail = m.user?.email?.toLowerCase() || '';
    const jobRole = (
      m.interviewConfig?.jobRole ||
      m.jobRole ||
      ''
    ).toLowerCase();
    const round = (m.interviewConfig?.round || m.round || '').toLowerCase();
    const category = (m.interviewConfig?.category || '').toLowerCase();

    return (
      userName.includes(query) ||
      userEmail.includes(query) ||
      jobRole.includes(query) ||
      round.includes(query) ||
      category.includes(query)
    );
  });
};

// ✅ MOVED OUTSIDE - Helper function to get stats
const getMeetingStats = (meetings) => {
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const todayMeetings = meetings.filter((m) => {
    const meetingDate = new Date(m.scheduledDate || m.date);
    return meetingDate.toDateString() === today.toDateString();
  });

  const thisWeekMeetings = meetings.filter((m) => {
    const meetingDate = new Date(m.scheduledDate || m.date);
    return meetingDate >= today && meetingDate <= weekFromNow;
  });

  const pendingMeetings = meetings.filter((m) => !m.attended);

  return {
    total: meetings.length,
    today: todayMeetings.length,
    thisWeek: thisWeekMeetings.length,
    pending: pendingMeetings.length,
  };
};

const UpcomingMeetings = ({ meetings, navigate }) => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date-asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Handlers
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleJoinMeeting = (meeting) => {
    navigate(`/interview?meetingId=${meeting.roomId || meeting._id}&admin=1`);
  };

  const handleMeetingSettings = (meetingId) => {
    navigate(`/admin-end-meeting/${meetingId}`);
  };

  // Memoized filtered and sorted meetings
  const processedMeetings = useMemo(() => {
    const filtered = filterMeetings(meetings, searchQuery);
    return sortMeetings(filtered, sortBy);
  }, [meetings, searchQuery, sortBy]);

  // Memoized stats
  const stats = useMemo(() => getMeetingStats(meetings), [meetings]);

  // Empty State
  if (meetings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              Upcoming Meetings
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              View scheduled interviews
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                <FaCalendarAlt className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Upcoming Meetings
              </h3>
              <p className="text-gray-500 text-sm">
                Schedule a new meeting from the Create Meeting tab
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Upcoming Meetings</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage scheduled interviews
          </p>
        </div>

        <div className="max-w-6xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Upcoming */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaCalendarCheck className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500">Total Upcoming</p>
                </div>
              </div>
            </div>

            {/* Today */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-green-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                  <FaCalendarDay className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.today}
                  </p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </div>

            {/* This Week */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaCalendarWeek className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.thisWeek}
                  </p>
                  <p className="text-xs text-gray-500">This Week</p>
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-yellow-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center border-2 border-dashed border-yellow-200">
                  <FaHourglassHalf className="text-yellow-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 mb-5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Left - Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaList className="text-blue-600" size={14} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Scheduled Interviews
                  </h2>
                  <p className="text-xs text-gray-500">
                    Showing {processedMeetings.length} of {meetings.length}{' '}
                    meetings
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              </div>

              {/* Right - Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FaSearch className="text-gray-400" size={12} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by name, email, role..."
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                    <FaSortAmountDown className="text-gray-400" size={12} />
                  </div>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-50 rounded-lg p-1 border border-dashed border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('list')}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaList size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewModeChange('grid')}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaThLarge size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* No Results State */}
          {processedMeetings.length === 0 && searchQuery && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                  <FaSearch className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  No meetings match "{searchQuery}"
                </p>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && processedMeetings.length > 0 && (
            <div className="space-y-3">
              {processedMeetings.map((m) => {
                const timeInfo = getTimeUntilMeeting(m);
                return (
                  <div
                    key={m._id}
                    className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold border-2 border-dashed border-blue-200 flex-shrink-0">
                          {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 text-sm truncate">
                            {m.user?.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {m.user?.email}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                        <div className="relative pl-3">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <FaCalendarAlt size={10} />
                            <span>Date</span>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {new Date(
                              m.scheduledDate || m.date
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <span
                            className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${timeInfo.color}`}
                          >
                            {timeInfo.text}
                          </span>
                        </div>

                        <div className="relative pl-3">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <FaClock size={10} />
                            <span>Time</span>
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {m.startTime || m.time}
                          </div>
                          <div className="text-xs text-gray-500">
                            {m.duration || 60} min
                          </div>
                        </div>

                        <div className="relative pl-3">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <FaBriefcase size={10} />
                            <span>Role</span>
                          </div>
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {m.interviewConfig?.jobRole || m.jobRole}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {m.interviewConfig?.round || m.round}
                          </div>
                        </div>

                        <div className="relative pl-3">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                          <div className="text-xs text-gray-500 mb-1">
                            Status
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed ${
                              m.attended
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {m.attended ? 'Attended' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleJoinMeeting(m)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <FaVideo size={12} />
                          <span>Join</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMeetingSettings(m._id)}
                          className="flex items-center justify-center w-9 h-9 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-dashed border-gray-300 transition-all"
                        >
                          <FaCog size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && processedMeetings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {processedMeetings.map((m) => {
                const timeInfo = getTimeUntilMeeting(m);
                return (
                  <div
                    key={m._id}
                    className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-blue-200 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4 pb-4 border-b border-dashed border-gray-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold text-lg border-2 border-dashed border-blue-200 flex-shrink-0">
                        {m.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {m.user?.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {m.user?.email}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${timeInfo.color}`}
                      >
                        {timeInfo.text}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 flex-shrink-0">
                          <FaCalendarAlt className="text-gray-400" size={12} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            Date & Time
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {new Date(
                              m.scheduledDate || m.date
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            • {m.startTime || m.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 flex-shrink-0">
                          <FaBriefcase className="text-gray-400" size={12} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-500">Position</div>
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {m.interviewConfig?.jobRole || m.jobRole}
                          </div>
                          <div className="text-xs text-gray-500">
                            {m.interviewConfig?.round || m.round}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 flex-shrink-0">
                          <FaClock className="text-gray-400" size={12} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Duration</div>
                          <div className="font-medium text-gray-900 text-sm">
                            {m.duration || 60} minutes
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed ${
                            m.attended
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {m.attended ? 'Attended' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-dashed border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleJoinMeeting(m)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <FaVideo size={12} />
                        <span>Join</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMeetingSettings(m._id)}
                        className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-dashed border-gray-300 transition-all"
                      >
                        <FaCog size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingMeetings;
