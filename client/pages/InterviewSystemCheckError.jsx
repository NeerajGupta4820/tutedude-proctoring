import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaExclamationTriangle,
  FaCamera,
  FaMicrophone,
  FaDesktop,
  FaArrowLeft,
  FaRedo,
  FaHeadset,
} from 'react-icons/fa';

const InterviewSystemCheckError = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    window.open('mailto:support@interviewproctor.com', '_blank');
  };

  return (
    <div className=" bg-gray-200 flex flex-col overflow-hidden">
      {/* ✅ Header */}
      <div className="bg-cyan-700 text-white px-6 py-3 shadow-lg flex-shrink-0">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-2xl font-bold hover:opacity-90 transition"
            >
              Interview Proctor
            </Link>
            <span className="text-sm bg-red-500/80 px-3 py-1 rounded-lg flex items-center gap-2">
              <FaExclamationTriangle size={12} />
              System Error
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition font-medium"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Main Content - Takes remaining height */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="max-w-2xl w-full">
          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Error Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaExclamationTriangle className="text-white text-3xl" />
              </div>
              <h1 className="text-xl font-bold text-white mb-1">
                System Compatibility Error
              </h1>
              <p className="text-red-100 text-sm">
                Your device doesn't meet the requirements for the interview
              </p>
            </div>

            {/* Error Details */}
            <div className="p-5">
              {/* Requirements List */}
              <div className="mb-4">
                <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2 text-sm">
                  <FaDesktop className="text-cyan-600" />
                  Required Components
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaCamera className="text-red-500" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">
                        Webcam
                      </p>
                      <p className="text-xs text-gray-500">
                        A working camera is required
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex-shrink-0">
                      Not Detected
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaMicrophone className="text-red-500" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">
                        Microphone
                      </p>
                      <p className="text-xs text-gray-500">
                        A working microphone is required
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex-shrink-0">
                      Not Detected
                    </span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                <p className="text-gray-700 text-center text-sm">
                  Sorry, your computer is not compatible. Please use a computer
                  with a <strong>webcam</strong> and <strong>microphone</strong>
                  .
                </p>
              </div>

              {/* Suggestions */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-1.5 text-sm">
                  💡 Suggestions:
                </h4>
                <ul className="text-xs text-blue-700 space-y-0.5">
                  <li>• Make sure camera and microphone are connected</li>
                  <li>• Check browser permissions for devices</li>
                  <li>• Try Chrome browser (recommended)</li>
                  <li>• Restart browser and try again</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
                >
                  <FaArrowLeft size={12} />
                  Go Back
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition text-sm"
                >
                  <FaRedo size={12} />
                  Retry Check
                </button>
                <button
                  onClick={handleContactSupport}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition text-sm"
                >
                  <FaHeadset size={12} />
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-gray-500 text-xs mt-4">
            If you continue to experience issues, please contact the interview
            administrator.
          </p>
        </div>
      </div>

      {/* ✅ Footer */}
      <div className="bg-cyan-700 text-white text-center py-2.5 flex-shrink-0">
        <p className="text-sm font-medium">
          © {new Date().getFullYear()} The Online Interview Proctor System
        </p>
      </div>
    </div>
  );
};

export default InterviewSystemCheckError;
