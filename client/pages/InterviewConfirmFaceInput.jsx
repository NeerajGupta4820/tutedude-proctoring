import React from 'react';
import { useNavigate,Link } from 'react-router-dom';

const interviewConfirmFaceInput = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <nav className="bg-cyan-700 h-14 flex items-center px-8">
      <Link to="/" className="font-bold text-lg tracking-wide text-white">
        The Online Interview Proctor
      </Link>
      </nav>
      <div className="flex flex-col items-center flex-1 justify-center mt-8">
        <div className="bg-white/80 shadow-lg rounded-xl w-full max-w-2xl p-8">
          <h1 className="text-3xl font-bold text-cyan-700 mb-4">Confirm your image?</h1>
          <div className="flex justify-center mb-4">
            <img src="/static/img/face-placeholder.png" alt="Face Preview" className="rounded-lg border-4 border-cyan-700 w-2/3 h-64 object-cover bg-black" />
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <button onClick={() => navigate('/face-input')} className="bg-cyan-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-cyan-700 border-2 border-cyan-700 transition">Retake Image</button>
            <button onClick={() => navigate('/meetingsetup')} className="bg-cyan-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-cyan-700 border-2 border-cyan-700 transition">Next</button>
          </div>
        </div>
      </div>
      <footer className="bg-cyan-700 text-black text-center py-3 font-bold mt-8">
        &copy; The Online interview Proctor System
      </footer>
    </div>
  );
};

export default interviewConfirmFaceInput;
