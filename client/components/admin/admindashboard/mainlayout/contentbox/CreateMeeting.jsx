import React, { useState } from 'react';
import axios from 'axios';
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaBriefcase,
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const CreateMeeting = ({ users, questions, onMeetingCreated }) => {
  const [form, setForm] = useState({
    candidateId: '',
    scheduledDate: '',
    startTime: '',
    duration: 60,
    interviewConfig: {
      type: 'technical',
      category: '',
      jobRole: '',
      round: '',
      experienceLevel: 'fresher',
    },
    enabledTools: {
      codeEditor: { enabled: false, languages: ['javascript'] },
      whiteboard: { enabled: false },
      screenShare: { enabled: false },
      videoCall: { enabled: true },
      chat: { enabled: true },
    },
    assignedQuestions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questionsDropdownOpen, setQuestionsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('interviewConfig.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        interviewConfig: { ...prev.interviewConfig, [field]: value },
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleToolToggle = (tool) => {
    setForm((prev) => ({
      ...prev,
      enabledTools: {
        ...prev.enabledTools,
        [tool]: {
          ...prev.enabledTools[tool],
          enabled: !prev.enabledTools[tool].enabled,
        },
      },
    }));
  };

  const handleQuestionToggle = (questionId) => {
    setForm((prev) => {
      const exists = prev.assignedQuestions.find(
        (q) => q.question === questionId
      );
      if (exists) {
        return {
          ...prev,
          assignedQuestions: prev.assignedQuestions.filter(
            (q) => q.question !== questionId
          ),
        };
      } else {
        return {
          ...prev,
          assignedQuestions: [
            ...prev.assignedQuestions,
            { question: questionId, timeAllocated: 10 },
          ],
        };
      }
    });
  };

  const handleRemoveQuestion = (questionId) => {
    setForm((prev) => ({
      ...prev,
      assignedQuestions: prev.assignedQuestions.filter(
        (q) => q.question !== questionId
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/meeting`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Meeting scheduled successfully! ✓');
      setForm({
        candidateId: '',
        scheduledDate: '',
        startTime: '',
        duration: 60,
        interviewConfig: {
          type: 'technical',
          category: '',
          jobRole: '',
          round: '',
          experienceLevel: 'fresher',
        },
        enabledTools: {
          codeEditor: { enabled: false, languages: ['javascript'] },
          whiteboard: { enabled: false },
          screenShare: { enabled: false },
          videoCall: { enabled: true },
          chat: { enabled: true },
        },
        assignedQuestions: [],
      });
      setSearchQuery('');

      if (onMeetingCreated) onMeetingCreated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    }
    setLoading(false);
  };

  // Filter questions based on search
  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.difficulty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Meeting</h2>
        <p className="text-gray-600 mt-2">
          Schedule an interview for a candidate
        </p>
      </div>

      <div className="bg-white rounded-b-lg shadow-sm">
        <form onSubmit={handleSubmit} className=" space-y-5">
          {/* Section 1: Basic Information */}
          <div className="bg-gray-50 r+ounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaUser className="text-cyan-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Select Candidate <span className="text-red-500">*</span>
                </label>
                <select
                  name="candidateId"
                  value={form.candidateId}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm bg-white"
                  required
                >
                  <option value="">Choose candidate...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Interview Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="interviewConfig.type"
                  value={form.interviewConfig.type}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm bg-white"
                  required
                >
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="aptitude">Aptitude</option>
                  <option value="data-entry">Data Entry</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Questions Selection - Moved here */}
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Assign Questions
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setQuestionsDropdownOpen(!questionsDropdownOpen)
                    }
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-700">
                      {form.assignedQuestions.length > 0
                        ? `${form.assignedQuestions.length} selected`
                        : 'Select...'}
                    </span>
                    {questionsDropdownOpen ? (
                      <FaChevronUp className="text-gray-400 text-xs" />
                    ) : (
                      <FaChevronDown className="text-gray-400 text-xs" />
                    )}
                  </button>

                  {questionsDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Search Box */}
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Questions List */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredQuestions.length === 0 ? (
                          <div className="p-3 text-center text-gray-500 text-xs">
                            {searchQuery
                              ? 'No questions found'
                              : 'No questions available'}
                          </div>
                        ) : (
                          <div>
                            {filteredQuestions.map((q) => {
                              const isSelected = form.assignedQuestions.find(
                                (aq) => aq.question === q._id
                              );
                              return (
                                <div
                                  key={q._id}
                                  onClick={() => handleQuestionToggle(q._id)}
                                  className={`px-3 py-2 cursor-pointer border-b border-gray-50 transition-colors text-xs ${
                                    isSelected
                                      ? 'bg-cyan-50'
                                      : 'bg-white hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-800">
                                        {q.title}
                                      </div>
                                      <div className="flex gap-1 mt-0.5">
                                        <span
                                          className={`px-1.5 py-0.5 text-xs rounded ${getDifficultyColor(q.difficulty)}`}
                                        >
                                          {q.difficulty}
                                        </span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <FaCheck className="text-cyan-600 text-xs" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-2 border-t border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setQuestionsDropdownOpen(false)}
                          className="w-full py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Questions Chips */}
            {form.assignedQuestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {form.assignedQuestions.map((aq) => {
                  const question = questions.find((q) => q._id === aq.question);
                  if (!question) return null;
                  return (
                    <div
                      key={aq.question}
                      className="flex items-center gap-1.5 px-2 py-1 bg-cyan-50 border border-cyan-200 rounded text-xs"
                    >
                      <span className="text-gray-700">{question.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(aq.question)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Schedule */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-cyan-600" />
              Schedule Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={form.scheduledDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  min="15"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Job Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaBriefcase className="text-cyan-600" />
              Position Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="interviewConfig.category"
                  value={form.interviewConfig.category}
                  onChange={handleChange}
                  placeholder="e.g., MERN Stack"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Job Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="interviewConfig.jobRole"
                  value={form.interviewConfig.jobRole}
                  onChange={handleChange}
                  placeholder="e.g., Full Stack Developer"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 text-gray-700 text-xs">
                  Round <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="interviewConfig.round"
                  value={form.interviewConfig.round}
                  onChange={handleChange}
                  placeholder="e.g., Technical Round 1"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Interview Tools */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Interview Tools
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { key: 'codeEditor', label: 'Code', icon: '💻' },
                { key: 'whiteboard', label: 'Board', icon: '📝' },
                { key: 'screenShare', label: 'Screen', icon: '🖥️' },
                { key: 'videoCall', label: 'Video', icon: '📹' },
                { key: 'chat', label: 'Chat', icon: '💬' },
              ].map((tool) => (
                <div
                  key={tool.key}
                  onClick={() => handleToolToggle(tool.key)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    form.enabledTools[tool.key].enabled
                      ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xl mb-0.5">{tool.icon}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {tool.label}
                    </div>
                    {form.enabledTools[tool.key].enabled && (
                      <div className="text-xs text-cyan-600 mt-0.5">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Submit Button - Right Aligned with Reduced Width */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm shadow-sm"
              disabled={loading}
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeeting;
