import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext';
import {
  FaCamera,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaBriefcase,
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaSignOutAlt, // ← Logout icon add kiya
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext); // ← logout add kiya
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/meeting/next', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const meetingData = res.data.data || res.data;
        setMeeting(meetingData);
      } catch (err) {
        setMeeting(null);
        if (err.response && err.response.status === 404) {
          setError('No upcoming meetings scheduled.');
        } else {
          setError('Failed to fetch meeting.');
        }
      }
      setLoading(false);
    };
    fetchMeeting();
  }, [user]);

  // ← Logout handler function
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNext = async (e) => {
    e.preventDefault();
    let webcamOk = false;
    let micOk = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      webcamOk = true;
      micOk = true;
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      webcamOk = false;
      micOk = false;
    }
    if (webcamOk && micOk) {
      if (meeting) {
        const meetingIdToUse = meeting.roomId || meeting._id;
        localStorage.setItem('meetingId', meetingIdToUse);
        navigate('/face-input', {
          state: {
            meetingId: meetingIdToUse,
            admin: 0,
          },
        });
        console.log('Using meetingId (roomId):', meetingIdToUse);
      }
    } else {
      navigate('/system-check-error');
    }
  };

  const getMeetingDate = () => {
    if (!meeting) return '';
    const dateValue = meeting.scheduledDate || meeting.date;
    if (!dateValue) return '';
    return new Date(dateValue).toISOString().slice(0, 10);
  };

  const getMeetingTime = () => {
    if (!meeting) return '';
    return meeting.startTime || meeting.time || '';
  };

  const getJobRole = () => {
    if (!meeting) return '';
    return meeting.interviewConfig?.jobRole || meeting.jobRole || '';
  };

  const getRound = () => {
    if (!meeting) return '';
    return meeting.interviewConfig?.round || meeting.round || '';
  };

  const rules = [
    {
      description:
        'Monitors your camera and microphone during the interview. When you load the interview, grant permissions for both to interview Proctor.',
      image: '../assets/101391-online-test_zu1cw4.gif',
    },
    {
      description:
        "If the camera doesn't detect your face, System calls these events VIOLATIONS.",
      image: '../assets/Not-detect-face.png',
    },
    {
      description:
        'During the interview, make sure the camera can focus on your face.',
      image: '../assets/Detect-face.png',
    },
    {
      description: 'Once your face is detected, the first photo will be taken.',
      image: '../assets/Take-photo.png',
    },
    {
      description:
        'Make sure that only you are in front of the interview. The background should be as clean as possible.',
      image: '../assets/Detect-two-persons.png',
    },
    {
      description:
        'You must take the interview in a quiet environment. If any sound is detected, it will be recorded.',
      image: '../assets/Talking.png',
    },
  ];

  const environmentTips = [
    'You must sit at a clean desk or table.',
    'You must take the interview in the same room that you scanned during the proctoring setup for the current interview.',
    'The room must be as quiet as possible. Sounds such as music or television are not permitted.',
    'No other person is allowed to enter the room while you are taking the proctored interview.',
    'The following items must not be on your desk or used during your proctored interview, unless posted rules for the interview specifically permit these materials: Books, Paper, Pens, Calculators, Textbooks, Notebooks, Phones.',
  ];

  return (
    <div className="min-h-screen w-screen bg-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-cyan-700 shadow-lg px-4 py-3 flex-shrink-0 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link
            to="/"
            className="text-xl font-bold text-white flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FaCamera className="text-white text-sm" />
            </div>
            <span className="hidden sm:inline">Interview Proctor</span>
          </Link>

          {/* ← Right side - User info and Logout button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-lg">
                Welcome, {user?.name || 'User'}
              </span>
            </div>

            {/* ← Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Rules & Regulations Section */}
          <section className="mb-10">
            <h2 className="text-center text-cyan-700 font-bold text-3xl md:text-4xl mb-8">
              Rules & Regulations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:scale-105 transition-transform"
                >
                  <img
                    className="w-40 h-40 object-contain mb-4"
                    src={rule.image}
                    alt="rule illustration"
                  />
                  <p className="text-gray-700 text-center">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Environment Setup Section */}
          <section className="mb-10">
            <h2 className="text-center text-cyan-700 font-bold text-3xl md:text-4xl mb-8">
              How to Setup Your Environment
            </h2>
            <div className="bg-cyan-700 text-white rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Test Environment</h3>
              <ul className="list-disc list-inside space-y-3 text-left">
                {environmentTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Meeting Card Section */}
          <section className="flex justify-center">
            <div className="w-full max-w-xl">
              {loading ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <FaSpinner className="animate-spin text-3xl text-cyan-600 mx-auto mb-3" />
                  <p className="text-gray-600">Loading meeting...</p>
                </div>
              ) : meeting ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-cyan-700 mb-4 flex items-center gap-2">
                    <FaCalendarAlt />
                    Your Upcoming Interview
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-cyan-600" />
                      <span className="font-semibold">Date:</span>
                      <span>{getMeetingDate()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-cyan-600" />
                      <span className="font-semibold">Time:</span>
                      <span>{getMeetingTime()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaBriefcase className="text-cyan-600" />
                      <span className="font-semibold">Job Role:</span>
                      <span>{getJobRole()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaLayerGroup className="text-cyan-600" />
                      <span className="font-semibold">Round:</span>
                      <span>{getRound()}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-700 text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-cyan-700 border-2 border-cyan-700 transition"
                  >
                    Next
                    <FaArrowRight />
                  </button>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <FaExclamationTriangle className="text-3xl text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cyan-700 py-4 flex-shrink-0">
        <p className="text-center text-white font-semibold">
          © {new Date().getFullYear()} The Online Interview Proctor System
        </p>
      </footer>
    </div>
  );
};

export default Home;
