import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const CreateMeeting = ({ users, questions, onMeetingCreated }) => {
  const [form, setForm] = useState({ 
    userId: '', 
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('interviewConfig.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        interviewConfig: { ...prev.interviewConfig, [field]: value }
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleToolToggle = (tool) => {
    setForm(prev => ({
      ...prev,
      enabledTools: {
        ...prev.enabledTools,
        [tool]: { ...prev.enabledTools[tool], enabled: !prev.enabledTools[tool].enabled }
      }
    }));
  };

  const handleQuestionToggle = (questionId) => {
    setForm(prev => {
      const exists = prev.assignedQuestions.find(q => q.question === questionId);
      if (exists) {
        return {
          ...prev,
          assignedQuestions: prev.assignedQuestions.filter(q => q.question !== questionId)
        };
      } else {
        return {
          ...prev,
          assignedQuestions: [...prev.assignedQuestions, { question: questionId, timeAllocated: 10 }]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/meeting`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Meeting scheduled successfully! ✓');
      setForm({ 
        userId: '', 
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
      
      if (onMeetingCreated) onMeetingCreated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Meeting</h2>
        <p className="text-gray-600 mt-2">Schedule an interview for a candidate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Select Candidate <span className="text-red-500">*</span>
            </label>
            <select 
              name="userId" 
              value={form.userId} 
              onChange={handleChange} 
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
              required
            >
              <option value="">-- Select a user --</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <select 
              name="interviewConfig.type" 
              value={form.interviewConfig.type} 
              onChange={handleChange} 
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
              required
            >
              <option value="technical">Technical</option>
              <option value="hr">HR</option>
              <option value="aptitude">Aptitude</option>
              <option value="data-entry">Data Entry</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="scheduledDate" 
              value={form.scheduledDate} 
              onChange={handleChange} 
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
              required 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Time <span className="text-red-500">*</span>
            </label>
            <input 
              type="time" 
              name="startTime" 
              value={form.startTime} 
              onChange={handleChange} 
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
              required 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Duration (minutes)
            </label>
            <input 
              type="number" 
              name="duration" 
              value={form.duration} 
              onChange={handleChange} 
              min="15"
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
            />
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="interviewConfig.category" 
              value={form.interviewConfig.category} 
              onChange={handleChange} 
              placeholder="e.g., MERN Stack, DSA"
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
              required 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Job Role <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="interviewConfig.jobRole" 
              value={form.interviewConfig.jobRole} 
              onChange={handleChange} 
              placeholder="e.g., Full Stack Developer"
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
              required 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Round <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="interviewConfig.round" 
              value={form.interviewConfig.round} 
              onChange={handleChange} 
              placeholder="e.g., Technical Round 1"
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500" 
              required 
            />
          </div>
        </div>

        {/* Tools Configuration */}
        <div>
          <label className="block font-semibold mb-3 text-gray-700">
            Interview Tools
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { key: 'codeEditor', label: '💻 Code Editor', icon: '👨‍💻' },
              { key: 'whiteboard', label: '📝 Whiteboard', icon: '✏️' },
              { key: 'screenShare', label: '🖥️ Screen Share', icon: '📺' },
              { key: 'videoCall', label: '📹 Video Call', icon: '🎥' },
              { key: 'chat', label: '💬 Chat', icon: '💭' },
            ].map(tool => (
              <div 
                key={tool.key}
                onClick={() => handleToolToggle(tool.key)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  form.enabledTools[tool.key].enabled 
                    ? 'border-cyan-500 bg-cyan-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{tool.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{tool.label.split(' ')[1]}</div>
                  {form.enabledTools[tool.key].enabled && (
                    <div className="mt-2 text-xs text-green-600 font-bold">✓ Enabled</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions Selection */}
        <div>
          <label className="block font-semibold mb-3 text-gray-700">
            Assign Questions ({form.assignedQuestions.length} selected)
          </label>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {questions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No questions available. Create questions first.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {questions.map(q => (
                  <div 
                    key={q._id}
                    onClick={() => handleQuestionToggle(q._id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      form.assignedQuestions.find(aq => aq.question === q._id) 
                        ? 'bg-cyan-50 border-l-4 border-cyan-500' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{q.title}</h4>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {q.questionType}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {q.category}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                      {form.assignedQuestions.find(aq => aq.question === q._id) && (
                        <div className="ml-4 text-green-600 text-2xl">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Submit */}
        <button 
          type="submit" 
          className="w-full bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50" 
          disabled={loading}
        >
          {loading ? 'Scheduling...' : 'Schedule Meeting'}
        </button>
      </form>
    </div>
  );
};

export default CreateMeeting;