import React, { useState, useMemo } from 'react';
import {
  FaThLarge,
  FaList,
  FaSortAmountDown,
  FaCalendarAlt,
  FaBriefcase,
  FaEdit,
  FaUsers,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartLine,
  FaVideo,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import UpdateMeeting from './UpdateMeeting';

// ✅ MOVED OUTSIDE - Sort options
const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'status-attended', label: 'Attended First' },
  { value: 'status-pending', label: 'Pending First' },
  { value: 'rating-high', label: 'Highest Rating' },
  { value: 'rating-low', label: 'Lowest Rating' },
];

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
    case 'status-attended':
      return sorted.sort((a, b) => (b.attended ? 1 : 0) - (a.attended ? 1 : 0));
    case 'status-pending':
      return sorted.sort((a, b) => (a.attended ? 1 : 0) - (b.attended ? 1 : 0));
    case 'rating-high':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'rating-low':
      return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
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
    const result = (m.result || '').toLowerCase();
    const status = m.attended ? 'attended' : 'pending';

    return (
      userName.includes(query) ||
      userEmail.includes(query) ||
      jobRole.includes(query) ||
      round.includes(query) ||
      result.includes(query) ||
      status.includes(query)
    );
  });
};

// ✅ MOVED OUTSIDE - Helper function to get stats
const getMeetingStats = (meetings) => {
  const attendedCount = meetings.filter((m) => m.attended).length;
  const pendingCount = meetings.filter((m) => !m.attended).length;
  const passRate =
    attendedCount > 0
      ? Math.round(
          (meetings.filter((m) => m.result === 'pass').length / attendedCount) *
            100
        )
      : 0;

  return {
    total: meetings.length,
    attended: attendedCount,
    pending: pendingCount,
    passRate,
  };
};

const AllMeetings = ({
  meetings,
  users,
  questions,
  navigate,
  onMeetingsUpdate,
}) => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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

  const handleUpdateClick = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setShowUpdateModal(true);
  };

  const handleUpdateComplete = () => {
    setShowUpdateModal(false);
    setSelectedMeetingId(null);
    if (onMeetingsUpdate) {
      onMeetingsUpdate();
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateModal(false);
    setSelectedMeetingId(null);
  };

  // Memoized filtered and sorted meetings
  const processedMeetings = useMemo(() => {
    const filtered = filterMeetings(meetings, searchQuery);
    return sortMeetings(filtered, sortBy);
  }, [meetings, searchQuery, sortBy]);

  // Memoized stats
  const stats = useMemo(() => getMeetingStats(meetings), [meetings]);

  // Show Update Modal
  if (showUpdateModal && selectedMeetingId) {
    return (
      <UpdateMeeting
        meetingId={selectedMeetingId}
        users={users}
        questions={questions}
        onMeetingUpdated={handleUpdateComplete}
        onCancel={handleCancelUpdate}
      />
    );
  }

  // Empty State
  if (meetings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">All Meetings</h1>
            <p className="text-gray-500 text-sm mt-1">
              View and manage all scheduled interviews
            </p>
          </div>
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                <FaCalendarAlt className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Meetings Found
              </h3>
              <p className="text-gray-500 text-sm">
                Create your first meeting to get started
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
          <h1 className="text-xl font-bold text-gray-900">All Meetings</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all scheduled interviews
          </p>
        </div>

        <div className="max-w-6xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Meetings */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaUsers className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500">Total Meetings</p>
                </div>
              </div>
            </div>

            {/* Attended */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-green-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                  <FaCheckCircle className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.attended}
                  </p>
                  <p className="text-xs text-gray-500">Attended</p>
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

            {/* Pass Rate */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaChartLine className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.passRate}%
                  </p>
                  <p className="text-xs text-gray-500">Pass Rate</p>
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
                  <h2 className="font-semibold text-gray-900">Meeting List</h2>
                  <p className="text-xs text-gray-500">
                    Showing {processedMeetings.length} of {meetings.length}{' '}
                    interviews
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
              {processedMeetings.map((m) => (
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
                        <div className="text-xs text-gray-500">
                          {m.startTime || m.time}
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
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed ${
                            m.attended
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {m.attended ? 'Attended' : 'Pending'}
                        </span>
                        {m.rating && (
                          <div className="text-xs font-medium text-gray-900 mt-1">
                            ⭐ {m.rating}/10
                          </div>
                        )}
                      </div>

                      <div className="relative pl-3">
                        <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                        <div className="text-xs text-gray-500 mb-1">Result</div>
                        {m.result && m.result !== 'pending' ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed ${
                              m.result === 'pass'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {m.result === 'pass' ? 'Pass' : 'Fail'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
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
                        onClick={() => handleUpdateClick(m._id)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-dashed border-gray-300 transition-all"
                      >
                        <FaEdit size={12} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && processedMeetings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {processedMeetings.map((m) => (
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
                    {m.result && m.result !== 'pending' && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border border-dashed flex-shrink-0 ${
                          m.result === 'pass'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {m.result === 'pass' ? 'Pass' : 'Fail'}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 flex-shrink-0">
                        <FaCalendarAlt className="text-gray-400" size={12} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Date & Time</div>
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

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
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
                      {m.rating && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Rating
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            ⭐ {m.rating}/10
                          </div>
                        </div>
                      )}
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
                      onClick={() => handleUpdateClick(m._id)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-dashed border-gray-300 transition-all"
                    >
                      <FaEdit size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllMeetings;
