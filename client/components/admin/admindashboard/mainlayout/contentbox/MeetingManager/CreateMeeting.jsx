import React, { useState } from 'react';
import axios from 'axios';
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaVideo,
  FaCode,
  FaDesktop,
  FaComments,
  FaChalkboard,
  FaClock,
  FaTools,
  FaRedo,
  FaPaperPlane,
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

// ✅ MOVED OUTSIDE - Card Component defined outside the main component
const Card = ({ icon: Icon, title, children, className = '' }) => (
  <div
    className={`bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-blue-200 transition-colors ${className}`}
  >
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
        <Icon className="text-blue-600" size={14} />
      </div>
      <h2 className="font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
      <div className="pl-4">{children}</div>
    </div>
  </div>
);

// ✅ MOVED OUTSIDE - Tools array defined outside
const TOOLS = [
  { key: 'codeEditor', label: 'Code Editor', icon: FaCode },
  { key: 'whiteboard', label: 'Whiteboard', icon: FaChalkboard },
  { key: 'screenShare', label: 'Screen Share', icon: FaDesktop },
  { key: 'videoCall', label: 'Video Call', icon: FaVideo },
  { key: 'chat', label: 'Chat', icon: FaComments },
];

// ✅ MOVED OUTSIDE - Helper function
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-50 text-green-600';
    case 'medium':
      return 'bg-yellow-50 text-yellow-600';
    case 'hard':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

// ✅ MOVED OUTSIDE - Initial form state
const getInitialFormState = () => ({
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

const CreateMeeting = ({ users, questions, onMeetingCreated }) => {
  const [form, setForm] = useState(getInitialFormState);
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
      setForm((prev) => ({ ...prev, [name]: value }));
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleQuestionsDropdown = () => {
    setQuestionsDropdownOpen((prev) => !prev);
  };

  const closeQuestionsDropdown = () => {
    setQuestionsDropdownOpen(false);
  };

  const resetForm = () => {
    setForm(getInitialFormState());
    setSearchQuery('');
    setError('');
    setSuccess('');
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

      setSuccess('Meeting scheduled successfully!');
      resetForm();
      if (onMeetingCreated) onMeetingCreated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    }
    setLoading(false);
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.difficulty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Create New Meeting
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Schedule an interview session for a candidate
          </p>
        </div>

        {/* Messages - Top */}
        {error && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border-2 border-dashed border-red-200 rounded-xl max-w-5xl">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-dashed border-red-300">
              <FaTimes className="text-red-500" size={12} />
            </div>
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border-2 border-dashed border-green-200 rounded-xl max-w-5xl">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-dashed border-green-300">
              <FaCheck className="text-green-500" size={12} />
            </div>
            <span className="text-green-600 text-sm">{success}</span>
          </div>
        )}

        {/* Main Form Container */}
        <div className="max-w-5xl">
          <form onSubmit={handleSubmit}>
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* ============ LEFT COLUMN ============ */}
              <div className="space-y-5">
                {/* 1. Basic Information Card */}
                <Card icon={FaUser} title="Basic Information">
                  <div className="space-y-4">
                    {/* Candidate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Candidate <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="candidateId"
                        value={form.candidateId}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        required
                      >
                        <option value="">Select candidate...</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Interview Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Interview Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="interviewConfig.type"
                        value={form.interviewConfig.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        required
                      >
                        <option value="technical">Technical</option>
                        <option value="hr">HR</option>
                        <option value="aptitude">Aptitude</option>
                        <option value="data-entry">Data Entry</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>

                    {/* Questions Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Assign Questions
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={toggleQuestionsDropdown}
                          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:border-blue-300 hover:bg-white transition-all"
                        >
                          <span
                            className={
                              form.assignedQuestions.length > 0
                                ? 'text-gray-900'
                                : 'text-gray-500'
                            }
                          >
                            {form.assignedQuestions.length > 0
                              ? `${form.assignedQuestions.length} questions selected`
                              : 'Select questions...'}
                          </span>
                          {questionsDropdownOpen ? (
                            <FaChevronUp className="text-gray-400" size={12} />
                          ) : (
                            <FaChevronDown
                              className="text-gray-400"
                              size={12}
                            />
                          )}
                        </button>

                        {questionsDropdownOpen && (
                          <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                            <div className="p-3 border-b border-gray-100 bg-gray-50">
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <FaSearch
                                    className="text-gray-400"
                                    size={12}
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={handleSearchChange}
                                  placeholder="Search questions..."
                                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>

                            <div className="max-h-52 overflow-y-auto">
                              {filteredQuestions.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                  No questions found
                                </div>
                              ) : (
                                filteredQuestions.map((q) => {
                                  const isSelected =
                                    form.assignedQuestions.find(
                                      (aq) => aq.question === q._id
                                    );
                                  return (
                                    <div
                                      key={q._id}
                                      onClick={() =>
                                        handleQuestionToggle(q._id)
                                      }
                                      className={`px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
                                        isSelected
                                          ? 'bg-blue-50'
                                          : 'hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {q.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span
                                              className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(q.difficulty)}`}
                                            >
                                              {q.difficulty}
                                            </span>
                                          </div>
                                        </div>
                                        <div
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            isSelected
                                              ? 'bg-blue-600 border-blue-600'
                                              : 'border-gray-300'
                                          }`}
                                        >
                                          {isSelected && (
                                            <FaCheck
                                              className="text-white"
                                              size={10}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {form.assignedQuestions.length} selected
                              </span>
                              <button
                                type="button"
                                onClick={closeQuestionsDropdown}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {form.assignedQuestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {form.assignedQuestions.map((aq) => {
                            const question = questions.find(
                              (q) => q._id === aq.question
                            );
                            if (!question) return null;
                            return (
                              <div
                                key={aq.question}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-dashed border-blue-200"
                              >
                                <span className="max-w-[100px] truncate">
                                  {question.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveQuestion(aq.question)
                                  }
                                  className="text-blue-400 hover:text-red-500"
                                >
                                  <FaTimes size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* 3. Interview Tools Card */}
                <Card icon={FaTools} title="Interview Tools">
                  <div className="space-y-2">
                    {TOOLS.map((tool) => {
                      const ToolIcon = tool.icon;
                      const isEnabled = form.enabledTools[tool.key].enabled;
                      return (
                        <button
                          key={tool.key}
                          type="button"
                          onClick={() => handleToolToggle(tool.key)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border border-dashed transition-all ${
                            isEnabled
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center border border-dashed ${
                              isEnabled
                                ? 'bg-blue-100 border-blue-300'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <ToolIcon
                              size={14}
                              className={
                                isEnabled ? 'text-blue-600' : 'text-gray-400'
                              }
                            />
                          </div>
                          <span
                            className={`text-sm font-medium flex-1 text-left ${
                              isEnabled ? 'text-blue-700' : 'text-gray-600'
                            }`}
                          >
                            {tool.label}
                          </span>
                          <div
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                isEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-5">
                {/* 2. Position Details Card */}
                <Card icon={FaBriefcase} title="Position Details">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="interviewConfig.category"
                        value={form.interviewConfig.category}
                        onChange={handleChange}
                        placeholder="e.g., MERN Stack, Java, Python"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Job Role <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="interviewConfig.jobRole"
                        value={form.interviewConfig.jobRole}
                        onChange={handleChange}
                        placeholder="e.g., Full Stack Developer"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Round <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="interviewConfig.round"
                        value={form.interviewConfig.round}
                        onChange={handleChange}
                        placeholder="e.g., Technical Round 1"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </Card>

                {/* 4. Schedule Details Card */}
                <Card icon={FaClock} title="Schedule Details">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="scheduledDate"
                          value={form.scheduledDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={form.startTime}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Duration
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="duration"
                          value={form.duration}
                          onChange={handleChange}
                          min={15}
                          className="w-20 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-center"
                        />
                        <span className="text-sm text-gray-500">minutes</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 5. Action Buttons Card */}
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                    <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                      <FaPaperPlane className="text-green-600" size={14} />
                    </div>
                    <h2 className="font-semibold text-gray-900">Actions</h2>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-white rounded-xl text-sm font-medium transition-all"
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center border border-dashed border-gray-300">
                        <FaRedo size={10} className="text-gray-500" />
                      </div>
                      <span>Reset</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-500">
                            <FaCalendarAlt size={10} />
                          </div>
                          <span>Schedule Meeting</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;
