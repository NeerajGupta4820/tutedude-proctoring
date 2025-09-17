import React, { useRef } from 'react';
import { useNavigate,Link } from 'react-router-dom';

const interviewFaceInput = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Placeholder for webcam stream logic
  // In production, use getUserMedia and draw a green rectangle overlay

  const handleSave = () => {
    // Here, you would capture the image and save it
    navigate('/confirm-face-input');
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <nav className="bg-cyan-700 h-14 flex items-center px-8">
      <Link to="/" className="font-bold text-lg tracking-wide text-white">
        The Online Interview Proctor
      </Link>
      </nav>
      <div className="flex flex-col items-center flex-1 justify-center mt-8">
        <div className="bg-white/80 shadow-lg rounded-xl w-full max-w-2xl p-8">
          <h1 className="text-3xl font-bold text-cyan-700 mb-4">Face Input</h1>
          <div className="flex justify-center mb-4">
            <video ref={videoRef} className="rounded-lg border-4 border-green-500 w-2/3 h-64 object-cover bg-black" autoPlay muted playsInline />
          </div>
          <p className="text-center text-red-600 mb-4">Make sure your face is properly positioned within the green rectangle box before capturing the photograph.</p>
          <div className="flex justify-center">
            <button onClick={handleSave} className="bg-cyan-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-cyan-700 border-2 border-cyan-700 transition">Save Image</button>
          </div>
        </div>
      </div>
      <footer className="bg-cyan-700 text-black text-center py-3 font-bold mt-8">
        &copy; The Online interview Proctor System
      </footer>
    </div>
  );
};

export default interviewFaceInput;
