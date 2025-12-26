import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FaCamera,
  FaRedo,
  FaArrowRight,
  FaCheck,
  FaUser,
  FaCheckCircle,
} from 'react-icons/fa';

const InterviewConfirmFaceInput = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get captured image from navigation state or localStorage
  const faceImage =
    location.state?.faceImage || localStorage.getItem('faceImage');

  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-cyan-700 shadow-lg px-4 py-2 flex-shrink-0">
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
          <div className="flex items-center gap-2 text-white">
            <FaCheckCircle className="text-green-400" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-lg">
              Confirm Photo
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 min-h-0">
        <div className="w-full max-w-4xl h-full max-h-[calc(100vh-120px)] flex gap-4">
          {/* Left Side - Image Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Image Container */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex-1 min-h-0 shadow-xl">
              {faceImage ? (
                <img
                  src={faceImage}
                  alt="Captured Face"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center text-gray-400">
                    <FaUser className="text-6xl mx-auto mb-3 opacity-50" />
                    <p>No image captured</p>
                  </div>
                </div>
              )}

              {/* Verified Badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                <FaCheck size={12} />
                Photo Ready
              </div>

              {/* Quality Indicators */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Face Detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Good Lighting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Clear Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => navigate('/face-input')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition border border-gray-300"
              >
                <FaRedo size={14} />
                Retake Photo
              </button>
              <button
                onClick={() => navigate('/meetingsetup')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition shadow-lg"
              >
                Continue
                <FaArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Side - Info Panel (Hidden on small screens) */}
          <div className="hidden lg:flex w-72 flex-col gap-3 flex-shrink-0">
            {/* Progress Card */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold">
                    Photo Captured
                  </h3>
                  <p className="text-gray-500 text-sm">Step 2 of 3</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-cyan-600 h-1.5 rounded-full w-2/3 transition-all" />
              </div>
            </div>

            {/* Confirmation Card */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 flex-1">
              <h4 className="text-gray-800 font-medium mb-3 flex items-center gap-2">
                <FaCheck className="text-green-500" />
                Verification Checklist
              </h4>
              <ul className="space-y-3">
                {[
                  { text: 'Face is clearly visible', checked: true },
                  { text: 'Good lighting quality', checked: true },
                  { text: 'No obstructions on face', checked: true },
                  { text: 'Looking at camera', checked: true },
                  { text: 'Neutral background', checked: true },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-gray-600 text-sm"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.checked ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <FaCheck
                        className={`text-xs ${
                          item.checked ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <span
                      className={
                        item.checked ? 'text-gray-700' : 'text-gray-400'
                      }
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Step Card */}
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
              <h4 className="text-cyan-800 font-medium mb-2">Next Step</h4>
              <p className="text-cyan-700 text-sm">
                After confirmation, you'll proceed to the meeting setup where
                you can configure your interview settings.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cyan-700 py-2 flex-shrink-0">
        <p className="text-center text-white text-sm font-medium">
          © {new Date().getFullYear()} The Online Interview Proctor System
        </p>
      </footer>
    </div>
  );
};

export default InterviewConfirmFaceInput;
