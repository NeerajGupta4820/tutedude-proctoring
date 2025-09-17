import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AuthContext } from '../components/AuthContext';


const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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
        setMeeting(res.data);
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

  // System check for webcam and microphone, then go to interview
  const handleNext = async (e) => {
    e.preventDefault();
    let webcamOk = false;
    let micOk = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      webcamOk = true;
      micOk = true;
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      webcamOk = false;
      micOk = false;
    }
    if (webcamOk && micOk) {
      navigate('/face-input');
    } else {
      navigate('/system-check-error');
    }
  };


  return (
    <main className="bg-gray-200 min-h-screen font-sans">
      <Navbar />

      {/* Section: Rules & Regulations */}
      <section id="section-diferenciais" className="max-w-5xl mx-auto mt-14 px-4">
        <h2 className="text-center text-cyan-700 font-bold text-4xl md:text-5xl py-8">Rules & Regulations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <img className="w-40 h-40 object-contain mb-4" src="../assets/101391-online-test_zu1cw4.gif" alt="image" />
            <p className="text-gray-700 text-center">Monitors your camera and microphone during the interview. When you load the interview, grant permissions for both to interview Proctor.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <img className="w-40 h-40 object-contain mb-4" src="../assets/Not-detect-face.png" alt="image" />
            <p className="text-gray-700 text-center">If the camera doesn't detect your face, System calls these events VIOLATIONS.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <img className="w-40 h-40 object-contain mb-4" src="../assets/Detect-face.png" alt="image" />
            <p className="text-gray-700 text-center">During the interview, make sure the camera can focus on your face.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <img className="w-40 h-40 object-contain mb-4" src="../assets/Take-photo.png" alt="image" />
            <p className="text-gray-700 text-center">Once your face is detected, the first photo will be taken.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <img className="w-40 h-40 object-contain mb-4" src="../assets/Detect-two-persons.png" alt="image" />
            <p className="text-gray-700 text-center">Make sure that only you are in front of the interview. The background should be as clean as possible.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
            <img className="w-40 h-40 object-contain mb-4" src="../assets/Talking.png" alt="image" />
            <p className="text-gray-700 text-center">You must take the interview in a quiet environment. If any sound is detected, it will be recorded.</p>
          </div>
        </div>
      </section>

      {/* Section: Requirements */}
      <h2 id="section-header-prof" className="text-center text-cyan-700 font-bold text-4xl md:text-5xl py-8">How to setup your Environment</h2>
      <section id="section-prof" className="max-w-3xl mx-auto mb-16 px-4">
        <div className="bg-cyan-700 text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Test environment</h2>
          <ul className="list-disc list-inside space-y-2 text-left">
            <li>You must sit at a clean desk or table.</li>
            <li>You must take the interview in the same room that you scanned during the proctoring setup for the current interview.</li>
            <li>The room must be as quiet as possible. Sounds such as music or television are not permitted.</li>
            <li>No other person is allowed to enter the room while you are taking the proctored interview.</li>
            <li>The following items must not be on your desk or used during your proctored interview, unless posted rules for the interview specifically permit these materials: Books, Paper, Pens, Calculators, Textbooks, Notebooks, Phones.</li>
          </ul>
        </div>
      </section>

      {/* Section: Meeting Card for User */}
      <section className="flex justify-center pt-10">
        <div className="w-full max-w-xl">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">Loading meeting...</div>
          ) : meeting ? (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-cyan-700 mb-2">Your Upcoming Interview</h2>
              <div className="mb-2"><span className="font-semibold">Date:</span> {meeting.date?.slice(0,10)}</div>
              <div className="mb-2"><span className="font-semibold">Time:</span> {meeting.time}</div>
              <div className="mb-2"><span className="font-semibold">Job Role:</span> {meeting.jobRole}</div>
              <div className="mb-2"><span className="font-semibold">Round:</span> {meeting.round}</div>
              <button
                onClick={handleNext}
                className="mt-4 bg-cyan-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-cyan-700 border-2 border-cyan-700 transition"
              >
                Next &raquo;
              </button>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">{error}</div>
          ) : null}
        </div>
      </section>

      {/* (Old Next Button removed, now in meeting card) */}

      {/* Footer */}
      <footer className="bg-cyan-700 text-white py-4">
        <div className="text-center font-semibold">&copy; The Online interview Proctor System</div>
      </footer>
    </main>

  );
};

export default Home;
