import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaThLarge,
  FaList,
  FaSortAmountDown,
  FaSearch,
  FaBriefcase,
  FaGraduationCap,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCheck,
  FaTimes,
  FaUsers,
  FaCheckCircle,
  FaHourglassHalf,
  FaFilter,
  FaUserPlus,
  FaEye,
} from 'react-icons/fa';
import ImagePreviewModal from '../../../../../dialogs/ImagePreviewModal';

const API_URL = 'http://localhost:5000/api';

const CandidateManagement = ({ candidates, onUpdate, onEdit, onView }) => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('name-asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filteredCandidates, setFilteredCandidates] = useState(candidates);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    let filtered = [...candidates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'approved') {
        filtered = filtered.filter((c) => c.isApproved);
      } else if (filterStatus === 'not-approved') {
        filtered = filtered.filter((c) => !c.isApproved);
      } else {
        filtered = filtered.filter((c) => c.status === filterStatus);
      }
    }

    // Experience filter
    if (filterExperience !== 'all') {
      filtered = filtered.filter((c) => c.experience === filterExperience);
    }

    // Sorting
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'status-approved':
        filtered.sort(
          (a, b) => (b.isApproved ? 1 : 0) - (a.isApproved ? 1 : 0)
        );
        break;
      case 'status-pending':
        filtered.sort(
          (a, b) => (a.isApproved ? 1 : 0) - (b.isApproved ? 1 : 0)
        );
        break;
      default:
        break;
    }

    setFilteredCandidates(filtered);
  }, [searchTerm, filterStatus, filterExperience, sortBy, candidates]);

  // Delete with Cloudinary cleanup
  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (
      !window.confirm(
        'Are you sure you want to delete this candidate? This will also delete their photo and resume from cloud storage.'
      )
    ) {
      return;
    }

    setDeleteLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/candidate/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to delete candidate:', err);
      alert(err.response?.data?.message || 'Failed to delete candidate');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleApprove = async (id, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/candidate/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (err) {
      console.error('Failed to approve candidate:', err);
      alert('Failed to approve candidate');
    }
  };

  const handleReject = async (id, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/candidate/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (err) {
      console.error('Failed to reject candidate:', err);
      alert('Failed to reject candidate');
    }
  };

  // Download resume from Cloudinary
  const downloadResume = (resumeUrl, candidateName, e) => {
    e?.stopPropagation();
    if (!resumeUrl) return;

    // Add Cloudinary download flag
    let downloadUrl = resumeUrl;
    if (resumeUrl.includes('cloudinary.com')) {
      downloadUrl = resumeUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${candidateName || 'candidate'}_resume`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Image preview
  const handleImageClick = (candidate, e) => {
    e?.stopPropagation();
    if (candidate.photo) {
      setImagePreview({
        url: candidate.photo,
        name: candidate.name,
      });
    }
  };

  // Row click -> View profile
  const handleRowClick = (candidate) => {
    if (onView) {
      onView(candidate);
    }
  };

  // Edit click
  const handleEditClick = (candidate, e) => {
    e?.stopPropagation();
    if (onEdit) {
      onEdit(candidate);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getExperienceColor = (experience) => {
    switch (experience) {
      case 'fresher':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'junior':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'mid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'senior':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Stats
  const totalCount = candidates.length;
  const approvedCount = candidates.filter((c) => c.isApproved).length;
  const pendingCount = candidates.filter((c) => c.status === 'pending').length;
  const scheduledCount = candidates.filter(
    (c) => c.status === 'scheduled'
  ).length;

  // Empty State
  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl">
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                <FaUsers className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Candidates Found
              </h3>
              <p className="text-gray-500 text-sm">
                Add your first candidate to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg">
      {/* Image Preview Modal */}
      {imagePreview && (
        <ImagePreviewModal
          imageUrl={imagePreview.url}
          name={imagePreview.name}
          onClose={() => setImagePreview(null)}
        />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Candidate Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all candidates
          </p>
        </div>

        <div className="max-w-6xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaUsers className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalCount}
                  </p>
                  <p className="text-xs text-gray-500">Total Candidates</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-green-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                  <FaCheckCircle className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {approvedCount}
                  </p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-yellow-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center border-2 border-dashed border-yellow-200">
                  <FaHourglassHalf className="text-yellow-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
                  <FaUserPlus className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {scheduledCount}
                  </p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 mb-5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaList className="text-blue-600" size={14} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Candidate List
                  </h2>
                  <p className="text-xs text-gray-500">
                    Showing {filteredCandidates.length} of {candidates.length}{' '}
                    candidates
                    {searchTerm && ` • Searching "${searchTerm}"`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <FaSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={12}
                  />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all w-48"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                    <FaFilter className="text-gray-400" size={10} />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                    <option value="not-approved">Not Approved</option>
                  </select>
                </div>

                {/* Experience Filter */}
                <select
                  value={filterExperience}
                  onChange={(e) => setFilterExperience(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="all">All Experience</option>
                  <option value="fresher">Fresher</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                </select>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                    <FaSortAmountDown className="text-gray-400" size={12} />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="status-approved">Approved First</option>
                    <option value="status-pending">Pending First</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-50 rounded-lg p-1 border border-dashed border-gray-200">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaList size={12} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
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

          {/* No Results */}
          {filteredCandidates.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                  <FaSearch className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterExperience('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && filteredCandidates.length > 0 && (
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate._id}
                  onClick={() => handleRowClick(candidate)}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          onClick={(e) => handleImageClick(candidate, e)}
                          className="w-11 h-11 rounded-xl object-cover border-2 border-dashed border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-11 h-11 bg-blue-100 rounded-xl items-center justify-center text-blue-600 font-semibold border-2 border-dashed border-blue-200 flex-shrink-0 ${candidate.photo ? 'hidden' : 'flex'}`}
                      >
                        {candidate.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {candidate.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {candidate.email}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                      <div className="relative pl-3">
                        <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <FaBriefcase size={10} />
                          <span>Position</span>
                        </div>
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {candidate.position || '-'}
                        </div>
                      </div>

                      <div className="relative pl-3">
                        <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <FaGraduationCap size={10} />
                          <span>Experience</span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed capitalize ${getExperienceColor(candidate.experience)}`}
                        >
                          {candidate.experience || '-'}
                        </span>
                      </div>

                      <div className="relative pl-3">
                        <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed capitalize ${getStatusColor(candidate.status)}`}
                        >
                          {candidate.status || 'pending'}
                        </span>
                      </div>

                      <div className="relative pl-3">
                        <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                        <div className="text-xs text-gray-500 mb-1">
                          Approved
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed ${candidate.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                        >
                          {candidate.isApproved ? (
                            <>
                              <FaCheck size={8} /> Yes
                            </>
                          ) : (
                            <>
                              <FaTimes size={8} /> No
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end flex-shrink-0">
                      {/* View */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(candidate);
                        }}
                        className="flex items-center justify-center w-9 h-9 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-dashed border-gray-200 transition-all"
                        title="View Profile"
                      >
                        <FaEye size={12} />
                      </button>

                      {/* Resume Download */}
                      {candidate.resume && (
                        <button
                          onClick={(e) =>
                            downloadResume(candidate.resume, candidate.name, e)
                          }
                          className="flex items-center justify-center w-9 h-9 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-dashed border-blue-200 transition-all"
                          title="Download Resume"
                        >
                          <FaDownload size={12} />
                        </button>
                      )}

                      {/* Approve/Reject */}
                      {!candidate.isApproved ? (
                        <button
                          onClick={(e) => handleApprove(candidate._id, e)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <FaCheck size={10} />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleReject(candidate._id, e)}
                          className="flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-sm font-medium border border-dashed border-orange-200 transition-all"
                        >
                          <FaTimes size={10} />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={(e) => handleEditClick(candidate, e)}
                        className="flex items-center justify-center w-9 h-9 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg border border-dashed border-purple-200 transition-all"
                        title="Edit"
                      >
                        <FaEdit size={12} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDelete(candidate._id, e)}
                        disabled={deleteLoading === candidate._id}
                        className="flex items-center justify-center w-9 h-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-dashed border-red-200 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading === candidate._id ? (
                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTrash size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && filteredCandidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate._id}
                  onClick={() => handleRowClick(candidate)}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4 pb-4 border-b border-dashed border-gray-100">
                    {candidate.photo ? (
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        onClick={(e) => handleImageClick(candidate, e)}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-dashed border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold text-lg border-2 border-dashed border-blue-200 flex-shrink-0">
                        {candidate.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {candidate.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {candidate.email}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border border-dashed flex-shrink-0 ${candidate.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                    >
                      {candidate.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 flex-shrink-0">
                        <FaBriefcase className="text-gray-400" size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500">Position</div>
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {candidate.position || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 flex-shrink-0">
                        <FaGraduationCap className="text-gray-400" size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500">Experience</div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed capitalize ${getExperienceColor(candidate.experience)}`}
                        >
                          {candidate.experience || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed capitalize ${getStatusColor(candidate.status)}`}
                        >
                          {candidate.status || 'pending'}
                        </span>
                      </div>
                      {candidate.resume && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Resume
                          </div>
                          <button
                            onClick={(e) =>
                              downloadResume(
                                candidate.resume,
                                candidate.name,
                                e
                              )
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-dashed border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <FaDownload size={8} />
                            <span>Download</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-dashed border-gray-100">
                    {!candidate.isApproved ? (
                      <button
                        onClick={(e) => handleApprove(candidate._id, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <FaCheck size={10} />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleReject(candidate._id, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-sm font-medium border border-dashed border-orange-200 transition-all"
                      >
                        <FaTimes size={10} />
                        <span>Reject</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleEditClick(candidate, e)}
                      className="flex items-center justify-center w-10 h-10 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg border border-dashed border-purple-200 transition-all"
                      title="Edit"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(candidate._id, e)}
                      disabled={deleteLoading === candidate._id}
                      className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-dashed border-red-200 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteLoading === candidate._id ? (
                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTrash size={12} />
                      )}
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

export default CandidateManagement;
