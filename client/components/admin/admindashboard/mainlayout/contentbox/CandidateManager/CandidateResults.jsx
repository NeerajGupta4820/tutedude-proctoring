import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTrophy,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaHourglassHalf,
  FaArrowLeft,
  FaChartBar,
  FaCode,
  FaComments,
  FaLightbulb,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaExclamationTriangle,
  FaStar,
  FaEye,
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const CandidateResults = ({ candidates, meetings, onViewCandidate }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);

  // Fetch results from completed meetings
  useEffect(() => {
    fetchResults();
  }, [meetings]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all interview results from the API
      const response = await axios.get(`${API_URL}/interview-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle different response structures
      let interviewResults = [];
      if (response.data?.data?.results) {
        interviewResults = response.data.data.results;
      } else if (Array.isArray(response.data?.data)) {
        interviewResults = response.data.data;
      } else if (Array.isArray(response.data)) {
        interviewResults = response.data;
      }

      // Enhance results with candidate data - use populated data from API
      const resultsData = interviewResults.map((result) => {
        // Use populated data from API response directly
        const candidateFromResult = result.candidate;
        const meetingFromResult = result.meeting;

        // Fallback to local data if API didn't populate
        const candidate = candidateFromResult || candidates.find(
          (c) => c._id === result.candidate
        );
        const meeting = meetingFromResult || meetings.find(
          (m) => m._id === result.meeting
        );

        return {
          ...result,
          candidateData: candidate,
          meetingData: meeting,
          // Map InterviewAnalysis fields to display format
          scheduledDate: meeting?.scheduledDate || result.createdAt,
          interviewConfig: meeting?.interviewConfig,
          evaluation: {
            overallRating: result.overallEvaluation?.overallRating,
            technicalScore: result.overallEvaluation?.technicalScore,
            communicationScore: result.overallEvaluation?.communicationScore,
            problemSolvingScore: result.overallEvaluation?.problemSolvingScore,
            codeQualityScore: result.overallEvaluation?.codeQualityScore,
            attitudeScore: result.overallEvaluation?.attitudeScore,
            result: result.result,
            feedback: result.feedback?.overallComment,
            strengths: result.feedback?.strengths || [],
            improvements: result.feedback?.weaknesses || [],
          },
          rating: result.overallEvaluation?.overallRating,
          // Attended status
          attended: result.attended !== undefined ? result.attended : (meeting?.attended !== false),
          // Integrity flags for cheating detection
          cheatingDetected: result.integrityFlags?.suspiciousActivity || false,
          cheatingDetails: result.integrityFlags?.notes || '',
          tabSwitchCount: result.integrityFlags?.tabSwitchCount || 0,
          copyPasteDetected: result.integrityFlags?.copyPasteDetected || false,
          // Result reason
          resultReason: result.resultReason || '',
          // Coding score
          codingScore: result.codingScore,
        };
      });

      setResults(resultsData);
    } catch (err) {
      console.error('Failed to fetch results:', err);
      // Fallback to meeting data if API fails
      const completedMeetings = meetings.filter(
        (m) => m.status === 'completed' || m.result !== 'pending'
      );
      const resultsData = completedMeetings.map((meeting) => {
        const candidate = candidates.find(
          (c) => c._id === meeting.candidate?._id || c._id === meeting.candidate
        );
        return {
          ...meeting,
          candidateData: candidate || meeting.candidate,
        };
      });
      setResults(resultsData);
    } finally {
      setLoading(false);
    }
  };

  // Filter results
  const filteredResults = results.filter((r) => {
    const candidateName = r.candidateData?.name || '';
    const candidateEmail = r.candidateData?.email || '';
    
    const matchesSearch =
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      filterResult === 'all' ||
      r.result === filterResult ||
      r.evaluation?.result === filterResult;
    
    return matchesSearch && matchesFilter;
  });

  const getResultColor = (result) => {
    switch (result) {
      case 'pass':
      case 'selected':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'fail':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'on-hold':
      case 'on_hold':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'pass':
      case 'selected':
        return <FaCheck size={10} />;
      case 'fail':
      case 'rejected':
        return <FaTimes size={10} />;
      case 'on-hold':
      case 'on_hold':
        return <FaHourglassHalf size={10} />;
      default:
        return <FaHourglassHalf size={10} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getResultLabel = (result) => {
    switch (result) {
      case 'pass':
      case 'selected':
        return 'Passed';
      case 'fail':
      case 'rejected':
        return 'Failed';
      case 'on-hold':
      case 'on_hold':
        return 'On Hold';
      default:
        return 'Pending';
    }
  };

  // Stats
  const passCount = results.filter((r) => r.result === 'pass' || r.evaluation?.result === 'selected').length;
  const failCount = results.filter((r) => r.result === 'fail' || r.evaluation?.result === 'rejected').length;
  const pendingCount = results.filter((r) => r.result === 'pending').length;

  // View detailed result
  const handleViewResult = (result) => {
    setSelectedResult(result);
  };

  // Back to list
  const handleBack = () => {
    setSelectedResult(null);
  };

  // View candidate profile
  const handleViewCandidate = (candidateData) => {
    if (onViewCandidate && candidateData) {
      onViewCandidate(candidateData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

  // Detailed Result View
  if (selectedResult) {
    const result = selectedResult;
    const candidate = result.candidateData;
    const evaluation = result.evaluation || {};

    return (
      <div className="min-h-screen bg-gray-50 rounded-lg">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-medium transition-all"
            >
              <FaArrowLeft size={12} />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Interview Result
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Detailed evaluation for {candidate?.name || 'Candidate'}
              </p>
            </div>
          </div>

          <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Candidate Info */}
            <div className="lg:col-span-1 space-y-5">
              {/* Candidate Card */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 text-center">
                <div className="mb-4">
                  {candidate?.photo ? (
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-20 h-20 rounded-2xl object-cover mx-auto border-4 border-dashed border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto border-4 border-dashed border-blue-200">
                      <span className="text-3xl font-bold text-blue-600">
                        {candidate?.name?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {candidate?.name || 'Unknown'}
                </h2>
                <p className="text-gray-500 text-sm mb-4">{candidate?.email}</p>

                {/* Result Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold border-2 border-dashed ${getResultColor(result.result || evaluation.result)}`}
                >
                  {getResultIcon(result.result || evaluation.result)}
                  {getResultLabel(result.result || evaluation.result)}
                </span>

                <button
                  onClick={() => handleViewCandidate(candidate)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FaUser size={12} />
                  View Profile
                </button>
              </div>

              {/* Interview Info */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
                    <FaCalendarAlt className="text-purple-600" size={14} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Interview Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(result.scheduledDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {result.interviewConfig?.type || 'Technical'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Round</span>
                    <span className="text-sm font-medium text-gray-900">
                      {result.interviewConfig?.round || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Job Role</span>
                    <span className="text-sm font-medium text-gray-900">
                      {result.interviewConfig?.jobRole || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Attended</span>
                    <span className={`text-sm font-semibold ${result.attended ? 'text-green-600' : 'text-red-600'}`}>
                      {result.attended ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Integrity / Proctoring Section */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 border-dashed ${result.cheatingDetected ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <FaExclamationTriangle className={result.cheatingDetected ? 'text-red-600' : 'text-green-600'} size={14} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Integrity Check</h3>
                </div>
                <div className="space-y-3">
                  {/* Cheating Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Suspicious Activity</span>
                    <span className={`text-sm font-semibold ${result.cheatingDetected ? 'text-red-600' : 'text-green-600'}`}>
                      {result.cheatingDetected ? 'Detected' : 'None'}
                    </span>
                  </div>
                  {/* Tab Switches */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tab Switches</span>
                    <span className={`text-sm font-medium ${result.tabSwitchCount > 3 ? 'text-red-600' : result.tabSwitchCount > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {result.tabSwitchCount || 0}
                    </span>
                  </div>
                  {/* Copy Paste */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Copy/Paste Detected</span>
                    <span className={`text-sm font-medium ${result.copyPasteDetected ? 'text-red-600' : 'text-green-600'}`}>
                      {result.copyPasteDetected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {/* Cheating Details */}
                  {result.cheatingDetected && result.cheatingDetails && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-dashed border-red-200">
                      <p className="text-xs text-red-700 font-medium mb-1">Details:</p>
                      <p className="text-xs text-red-600">{result.cheatingDetails}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Result Reason */}
              {result.resultReason && (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center border-2 border-dashed border-orange-200">
                      <FaComments className="text-orange-600" size={14} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Result Reason</h3>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
                    {result.resultReason}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Scores */}
            <div className="lg:col-span-2 space-y-5">
              {/* Scores Grid */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                    <FaChartBar className="text-green-600" size={14} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Evaluation Scores</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Overall Rating */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-dashed border-blue-200 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaStar className="text-blue-500" size={12} />
                      <span className="text-xs font-medium text-blue-600">Overall</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {evaluation.overallRating || result.rating || '-'}/10
                    </p>
                  </div>

                  {/* Technical */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-dashed border-purple-200 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaCode className="text-purple-500" size={12} />
                      <span className="text-xs font-medium text-purple-600">Technical</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                      {evaluation.technicalScore || '-'}/10
                    </p>
                  </div>

                  {/* Communication */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-dashed border-green-200 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaComments className="text-green-500" size={12} />
                      <span className="text-xs font-medium text-green-600">Comm.</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {evaluation.communicationScore || '-'}/10
                    </p>
                  </div>

                  {/* Problem Solving */}
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-dashed border-orange-200 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaLightbulb className="text-orange-500" size={12} />
                      <span className="text-xs font-medium text-orange-600">Problem</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                      {evaluation.problemSolvingScore || '-'}/10
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {(result.review || evaluation.feedback) && (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                    <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center border-2 border-dashed border-yellow-200">
                      <FaComments className="text-yellow-600" size={14} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Feedback</h3>
                  </div>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200">
                    {evaluation.feedback || result.review || 'No feedback provided.'}
                  </p>
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <FaCheck size={12} /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaCheck size={8} className="text-green-600" />
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.improvements && evaluation.improvements.length > 0 && (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                    <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <FaLightbulb size={12} /> Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {evaluation.improvements.map((i, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaLightbulb size={8} className="text-orange-600" />
                          </span>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results List View
  return (
    <div className="min-h-screen bg-gray-50 rounded-lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Candidate Results</h1>
          <p className="text-gray-500 text-sm mt-1">
            View interview results and evaluations
          </p>
        </div>

        <div className="max-w-6xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaTrophy className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                  <p className="text-xs text-gray-500">Total Results</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-green-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                  <FaCheck className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{passCount}</p>
                  <p className="text-xs text-gray-500">Passed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-red-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center border-2 border-dashed border-red-200">
                  <FaTimes className="text-red-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{failCount}</p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-yellow-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center border-2 border-dashed border-yellow-200">
                  <FaHourglassHalf className="text-yellow-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 mb-5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
                  <FaTrophy className="text-purple-600" size={14} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Results List</h2>
                  <p className="text-xs text-gray-500">
                    Showing {filteredResults.length} of {results.length} results
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
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                    <FaFilter className="text-gray-400" size={10} />
                  </div>
                  <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="all">All Results</option>
                    <option value="pass">Passed</option>
                    <option value="fail">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredResults.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                  <FaTrophy className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-500 text-sm">
                  {results.length === 0
                    ? 'No completed interviews yet'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            </div>
          )}

          {/* Results List */}
          {filteredResults.length > 0 && (
            <div className="space-y-3">
              {filteredResults.map((result) => {
                const candidate = result.candidateData;
                const evaluation = result.evaluation || {};
                const displayResult = result.result || evaluation.result || 'pending';

                return (
                  <div
                    key={result._id}
                    onClick={() => handleViewResult(result)}
                    className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Candidate Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {candidate?.photo ? (
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="w-11 h-11 rounded-xl object-cover border-2 border-dashed border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold border-2 border-dashed border-blue-200 flex-shrink-0">
                            {candidate?.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                            {candidate?.name || 'Unknown Candidate'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {candidate?.email}
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
                            {formatDate(result.scheduledDate)}
                          </div>
                        </div>

                        <div className="relative pl-3">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <FaBriefcase size={10} />
                            <span>Type</span>
                          </div>
                          <div className="font-medium text-gray-900 text-sm capitalize">
                            {result.interviewConfig?.type || 'Technical'}
                          </div>
                        </div>

                        <div className="relative pl-3">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                          <div className="text-xs text-gray-500 mb-1">Rating</div>
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-500" size={12} />
                            <span className="font-bold text-gray-900">
                              {evaluation.overallRating || result.rating || '-'}/10
                            </span>
                          </div>
                        </div>

                        <div className="relative pl-3">
                          <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
                          <div className="text-xs text-gray-500 mb-1">Result</div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border border-dashed ${getResultColor(displayResult)}`}
                          >
                            {getResultIcon(displayResult)}
                            {getResultLabel(displayResult)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewResult(result);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <FaEye size={12} />
                          <span>View</span>
                        </button>
                      </div>
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

export default CandidateResults;
