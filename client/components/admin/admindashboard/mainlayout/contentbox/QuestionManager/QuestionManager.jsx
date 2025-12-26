import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
  FaEdit,
  FaTrash,
  FaCode,
  FaClock,
  FaMemory,
  FaTimes,
  FaEye,
  FaList,
  FaQuestionCircle,
  FaLightbulb,
  FaCheckCircle,
  FaExclamationCircle,
  FaFire,
  FaSearch,
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

// ✅ MOVED OUTSIDE - Helper functions
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'hard':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const getDifficultyIcon = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return <FaCheckCircle className="text-green-500" size={14} />;
    case 'medium':
      return <FaExclamationCircle className="text-yellow-500" size={14} />;
    case 'hard':
      return <FaFire className="text-red-500" size={14} />;
    default:
      return null;
  }
};

// ✅ MOVED OUTSIDE - Tab options
const TABS = ['all', 'easy', 'medium', 'hard'];

const QuestionManager = ({ questions, onUpdate, onEdit }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?'))
      return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/question/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Search change handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // View question handler
  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setSelectedQuestion(null);
  };

  // Edit from modal handler
  const handleEditFromModal = () => {
    onEdit(selectedQuestion);
    setSelectedQuestion(null);
  };

  // Filtered questions with search and tab filter
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Tab filter
      const matchesTab = activeTab === 'all' || q.difficulty === activeTab;

      // Search filter
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        searchLower === '' ||
        q.title?.toLowerCase().includes(searchLower) ||
        q.description?.toLowerCase().includes(searchLower) ||
        q.category?.toLowerCase().includes(searchLower) ||
        q.difficulty?.toLowerCase().includes(searchLower);

      return matchesTab && matchesSearch;
    });
  }, [questions, activeTab, searchQuery]);

  // Stats counts
  const easyCount = questions.filter((q) => q.difficulty === 'easy').length;
  const mediumCount = questions.filter((q) => q.difficulty === 'medium').length;
  const hardCount = questions.filter((q) => q.difficulty === 'hard').length;

  // Get count for tab
  const getTabCount = (tab) => {
    switch (tab) {
      case 'easy':
        return easyCount;
      case 'medium':
        return mediumCount;
      case 'hard':
        return hardCount;
      default:
        return questions.length;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage DSA questions for interviews
          </p>
        </div>

        <div className="max-w-6xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Questions */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <FaQuestionCircle className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {questions.length}
                  </p>
                  <p className="text-xs text-gray-500">Total Questions</p>
                </div>
              </div>
            </div>

            {/* Easy */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-green-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                  <FaCheckCircle className="text-green-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {easyCount}
                  </p>
                  <p className="text-xs text-gray-500">Easy</p>
                </div>
              </div>
            </div>

            {/* Medium */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-yellow-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center border-2 border-dashed border-yellow-200">
                  <FaExclamationCircle className="text-yellow-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mediumCount}
                  </p>
                  <p className="text-xs text-gray-500">Medium</p>
                </div>
              </div>
            </div>

            {/* Hard */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-red-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center border-2 border-dashed border-red-200">
                  <FaFire className="text-red-600" size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{hardCount}</p>
                  <p className="text-xs text-gray-500">Hard</p>
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
                  <h2 className="font-semibold text-gray-900">DSA Questions</h2>
                  <p className="text-xs text-gray-500">
                    Showing {filteredQuestions.length} of {questions.length}{' '}
                    problems
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              </div>

              {/* Right - Search and Tabs */}
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
                    placeholder="Search questions..."
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

                {/* Tabs */}
                <div className="flex bg-gray-50 rounded-lg p-1 border border-dashed border-gray-200">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleTabChange(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                      {tab !== 'all' && (
                        <span className="ml-1.5 text-xs opacity-75">
                          ({getTabCount(tab)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                  {searchQuery ? (
                    <FaSearch className="text-gray-400 text-2xl" />
                  ) : (
                    <FaCode className="text-gray-400 text-2xl" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No Results Found' : 'No Questions Found'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {searchQuery
                    ? `No questions match "${searchQuery}"`
                    : 'Create your first DSA question to get started'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question, index) => (
                <div
                  key={question._id}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-blue-200 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left - Number & Title */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-200 flex-shrink-0">
                        <span className="text-sm font-mono font-bold text-gray-500">
                          {question.questionNumber || index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {question.title}
                        </h3>
                        {question.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {question.description}
                          </p>
                        )}
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-dashed border-blue-200">
                            <FaCode size={10} />
                            {question.category}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed ${getDifficultyColor(
                              question.difficulty
                            )}`}
                          >
                            {getDifficultyIcon(question.difficulty)}
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex gap-2 justify-end flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleViewQuestion(question)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-dashed border-gray-300 transition-all"
                        title="View Details"
                      >
                        <FaEye size={12} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(question)}
                        className="flex items-center justify-center w-9 h-9 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-dashed border-blue-200 transition-all"
                        title="Edit"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(question._id)}
                        className="flex items-center justify-center w-9 h-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-dashed border-red-200 transition-all"
                        title="Delete"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Preview Modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-dashed border-gray-200 px-6 py-4 z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200 flex-shrink-0">
                      <span className="text-sm font-mono font-bold text-blue-600">
                        #{selectedQuestion.questionNumber}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedQuestion.title}
                      </h2>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed ${getDifficultyColor(
                            selectedQuestion.difficulty
                          )}`}
                        >
                          {getDifficultyIcon(selectedQuestion.difficulty)}
                          {selectedQuestion.difficulty}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 border border-dashed border-blue-200 rounded-full text-xs font-medium">
                          <FaCode size={10} />
                          {selectedQuestion.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Problem Statement */}
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                      <FaQuestionCircle className="text-gray-500" size={12} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Problem Statement
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed pl-9">
                    {selectedQuestion.problemStatement}
                  </p>
                </div>

                {/* Examples */}
                {selectedQuestion.examples?.length > 0 && (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center border border-dashed border-green-200">
                        <FaCode className="text-green-600" size={12} />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Examples
                      </h3>
                    </div>
                    <div className="space-y-3 pl-9">
                      {selectedQuestion.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-900 rounded-xl p-4 border border-gray-700"
                        >
                          <div className="text-xs text-gray-400 mb-2">
                            Example {idx + 1}
                          </div>
                          <div className="font-mono text-sm text-green-400 space-y-1">
                            <div>
                              <span className="text-gray-500">Input: </span>
                              {example.input}
                            </div>
                            <div>
                              <span className="text-gray-500">Output: </span>
                              <span className="text-blue-400">
                                {example.output}
                              </span>
                            </div>
                          </div>
                          {example.explanation && (
                            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                              <span className="text-gray-500">
                                Explanation:{' '}
                              </span>
                              {example.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {selectedQuestion.constraints?.length > 0 && (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center border border-dashed border-yellow-200">
                        <FaExclamationCircle
                          className="text-yellow-600"
                          size={12}
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Constraints
                      </h3>
                    </div>
                    <ul className="space-y-1.5 pl-9">
                      {selectedQuestion.constraints.map((c, idx) => (
                        <li
                          key={idx}
                          className="text-sm font-mono text-gray-700 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Complexity */}
                {selectedQuestion.solution && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border-2 border-dashed border-blue-200 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center border border-dashed border-blue-200">
                          <FaClock className="text-blue-600" size={12} />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          Time Complexity
                        </span>
                      </div>
                      <p className="font-mono text-xl font-bold text-blue-600 pl-9">
                        {selectedQuestion.solution.timeComplexity || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border-2 border-dashed border-purple-200 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center border border-dashed border-purple-200">
                          <FaMemory className="text-purple-600" size={12} />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          Space Complexity
                        </span>
                      </div>
                      <p className="font-mono text-xl font-bold text-purple-600 pl-9">
                        {selectedQuestion.solution.spaceComplexity || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Solution Explanation */}
                {selectedQuestion.solution?.explanation && (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center border border-dashed border-green-200">
                        <FaCheckCircle className="text-green-600" size={12} />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Solution Approach
                      </h3>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed pl-9">
                      {selectedQuestion.solution.explanation}
                    </p>
                  </div>
                )}

                {/* Hints */}
                {selectedQuestion.hints?.length > 0 && (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center border border-dashed border-yellow-200">
                        <FaLightbulb className="text-yellow-600" size={12} />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Hints
                      </h3>
                    </div>
                    <div className="space-y-2 pl-9">
                      {selectedQuestion.hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-dashed border-yellow-200"
                        >
                          <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded flex-shrink-0">
                            {hint.level}
                          </span>
                          <p className="text-sm text-gray-700">{hint.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-dashed border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleEditFromModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FaEdit size={12} />
                  <span>Edit Question</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionManager;
