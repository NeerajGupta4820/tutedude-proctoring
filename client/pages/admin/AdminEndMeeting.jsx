import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaStar,
  FaCheck,
  FaTimes,
  FaUser,
  FaBriefcase,
  FaLayerGroup,
  FaCalendarAlt,
  FaSpinner,
  FaHome,
  FaExclamationTriangle,
  FaUserSlash,
  FaBan,
  FaQuestionCircle,
  FaEye,
  FaClipboardCheck,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';

const AdminEndMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rating: 5,
    review: '',
    result: 'pending',
    attended: true,
    cheatingDetected: false,
    cheatingDetails: '',
    failReason: '',
  });
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // Multi-step form

  const failReasons = [
    { id: 'insufficient', label: 'Insufficient Knowledge', icon: FaQuestionCircle, color: 'text-amber-500' },
    { id: 'cheating', label: 'Cheating Detected', icon: FaExclamationTriangle, color: 'text-red-500' },
    { id: 'no_show', label: 'No Show / Left Early', icon: FaUserSlash, color: 'text-gray-500' },
    { id: 'poor_communication', label: 'Poor Communication', icon: FaComment, color: 'text-blue-500' },
    { id: 'unprofessional', label: 'Unprofessional Behavior', icon: FaBan, color: 'text-purple-500' },
    { id: 'other', label: 'Other Reason', icon: FaClipboardCheck, color: 'text-slate-500' },
  ];

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/meeting/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meetingData = res.data.data || res.data;
        setMeeting(meetingData);
        setForm({
          rating: meetingData.rating || 5,
          review: meetingData.review || '',
          result: meetingData.result || 'pending',
          attended: meetingData.attended !== false,
          cheatingDetected: meetingData.cheatingDetected || false,
          cheatingDetails: meetingData.cheatingDetails || '',
          failReason: meetingData.failReason || '',
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError(err.response?.data?.message || 'Failed to fetch meeting details');
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/meeting/${id}`,
        {
          ...form,
          status: 'completed',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Interview evaluation saved successfully!');
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update meeting');
    }
    setUpdateLoading(false);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Star Rating Component
  const StarRating = () => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            star <= form.rating
              ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 scale-110'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          <FaStar size={14} />
        </button>
      ))}
      <span className="ml-2 text-lg font-bold text-slate-800">{form.rating}/10</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <HiSparkles className="text-white text-2xl" />
          </div>
          <p className="text-slate-600 font-medium">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!meeting && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-2xl" />
          </div>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button
            onClick={handleGoToDashboard}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto hover:shadow-lg transition-all"
          >
            <FaHome />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getCandidateName = () => {
    if (meeting?.candidate?.name) return meeting.candidate.name;
    if (meeting?.user?.name) return meeting.user.name;
    return 'Unknown Candidate';
  };

  const getMeetingDate = () => {
    const dateValue = meeting?.scheduledDate || meeting?.date;
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const getJobRole = () => meeting?.interviewConfig?.jobRole || meeting?.jobRole || 'N/A';
  const getRound = () => meeting?.interviewConfig?.round || meeting?.round || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl px-4 py-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Link
            to="/dashboard"
            className="text-white/80 flex items-center gap-2 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
          >
            <FaArrowLeft size={14} />
            <span className="hidden sm:inline text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaClipboardCheck className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Interview Evaluation</h1>
              <p className="text-slate-400 text-xs">Complete and submit feedback</p>
            </div>
          </div>
          <button
            onClick={handleGoToDashboard}
            className="text-white/80 flex items-center gap-2 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
          >
            <FaHome size={14} />
            <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Candidate Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {getCandidateName().charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{getCandidateName()}</h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <FaBriefcase size={12} className="text-blue-500" />
                  {getJobRole()}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <FaLayerGroup size={12} className="text-purple-500" />
                  {getRound()}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <FaCalendarAlt size={12} className="text-emerald-500" />
                  {getMeetingDate()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                step === s
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : step > s
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {step > s ? <FaCheck size={12} /> : <span className="font-bold">{s}</span>}
              <span className="text-sm font-medium hidden sm:inline">
                {s === 1 && 'Attendance'}
                {s === 2 && 'Evaluation'}
                {s === 3 && 'Result'}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Attendance & Cheating */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Attendance & Conduct
              </h3>

              {/* Attended Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-800">Candidate Attended</p>
                  <p className="text-sm text-slate-500">Did the candidate join the interview?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, attended: !prev.attended }))}
                  className={`w-14 h-8 rounded-full transition-all duration-300 ${
                    form.attended ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    form.attended ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Cheating Detection */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <FaExclamationTriangle className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Cheating Detected?</p>
                      <p className="text-sm text-slate-500">Report any suspicious behavior</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, cheatingDetected: !prev.cheatingDetected }))}
                    className={`w-14 h-8 rounded-full transition-all duration-300 ${
                      form.cheatingDetected ? 'bg-red-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      form.cheatingDetected ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {form.cheatingDetected && (
                  <div className="mt-4 animate-fadeIn">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Describe the cheating behavior *
                    </label>
                    <textarea
                      name="cheatingDetails"
                      value={form.cheatingDetails}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-red-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                      placeholder="e.g., Looking at another screen, someone else in the room, using external help..."
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Continue to Evaluation
                <HiLightningBolt />
              </button>
            </div>
          )}

          {/* Step 2: Rating & Feedback */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaStar className="text-amber-400" />
                Performance Evaluation
              </h3>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Overall Performance Rating
                </label>
                <StarRating />
              </div>

              {/* Quick Feedback Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Quick Feedback (Click to add)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Strong technical skills',
                    'Good communication',
                    'Quick learner',
                    'Problem solver',
                    'Needs improvement',
                    'Lacks experience',
                    'Great attitude',
                    'Not suitable',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        review: prev.review ? `${prev.review}, ${tag}` : tag
                      }))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg text-sm transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Review */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Detailed Review / Feedback
                </label>
                <textarea
                  name="review"
                  value={form.review}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your detailed feedback about the candidate's performance..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Continue to Result
                  <HiLightningBolt />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Final Result */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaClipboardCheck className="text-emerald-500" />
                Final Decision
              </h3>

              {/* Result Selection */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, result: 'pass', failReason: '' }))}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    form.result === 'pass'
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    form.result === 'pass' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-500'
                  }`}>
                    <FaThumbsUp size={24} />
                  </div>
                  <p className={`font-bold ${form.result === 'pass' ? 'text-emerald-700' : 'text-slate-700'}`}>
                    PASS
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Candidate passed</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, result: 'fail' }))}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    form.result === 'fail'
                      ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/20'
                      : 'border-slate-200 hover:border-red-300'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    form.result === 'fail' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500'
                  }`}>
                    <FaThumbsDown size={24} />
                  </div>
                  <p className={`font-bold ${form.result === 'fail' ? 'text-red-700' : 'text-slate-700'}`}>
                    FAIL
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Did not qualify</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, result: 'pending', failReason: '' }))}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    form.result === 'pending'
                      ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/20'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    form.result === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-500'
                  }`}>
                    <FaEye size={24} />
                  </div>
                  <p className={`font-bold ${form.result === 'pending' ? 'text-amber-700' : 'text-slate-700'}`}>
                    PENDING
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Decide later</p>
                </button>
              </div>

              {/* Fail Reason Selection */}
              {form.result === 'fail' && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Reason for Failing *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {failReasons.map((reason) => {
                      const Icon = reason.icon;
                      const isSelected = form.failReason === reason.id;
                      return (
                        <button
                          key={reason.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, failReason: reason.id }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`${reason.color} mb-2`} size={18} />
                          <p className={`text-sm font-medium ${isSelected ? 'text-red-700' : 'text-slate-700'}`}>
                            {reason.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-slate-800">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Rating:</span>
                    <span className="font-semibold text-slate-800 ml-2">{form.rating}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Attended:</span>
                    <span className={`font-semibold ml-2 ${form.attended ? 'text-emerald-600' : 'text-red-600'}`}>
                      {form.attended ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Cheating:</span>
                    <span className={`font-semibold ml-2 ${form.cheatingDetected ? 'text-red-600' : 'text-emerald-600'}`}>
                      {form.cheatingDetected ? 'Detected' : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Result:</span>
                    <span className={`font-semibold ml-2 ${
                      form.result === 'pass' ? 'text-emerald-600' : 
                      form.result === 'fail' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {form.result.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-200">
                  <FaTimes />
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-2 border border-emerald-200">
                  <FaCheck />
                  {success}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={updateLoading || (form.result === 'fail' && !form.failReason)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Submit Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminEndMeeting;
