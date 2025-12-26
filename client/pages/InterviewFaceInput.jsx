import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaCamera,
  FaRedo,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaUser,
  FaLightbulb,
} from 'react-icons/fa';

const InterviewFaceInput = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  const startWebcam = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsLoading(false);
          setHasPermission(true);
          setTimeout(() => setIsFaceDetected(true), 1500);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setIsLoading(false);
      setHasPermission(false);

      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a webcam.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    startWebcam();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startWebcam]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsFaceDetected(false);
    startWebcam();
  };

  const handleSave = () => {
    if (capturedImage) {
      localStorage.setItem('faceImage', capturedImage);
      navigate('/confirm-face-input', { state: { faceImage: capturedImage } });
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col overflow-hidden">
      {/* Header - Original Cyan Color */}
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
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-lg">
              Face Verification
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 min-h-0">
        <div className="w-full max-w-4xl h-full max-h-[calc(100vh-120px)] flex gap-4">
          {/* Left Side - Camera */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Camera Container */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex-1 min-h-0 shadow-xl">
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-cyan-500 mx-auto mb-3" />
                    <p className="text-white text-sm">Initializing camera...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10 p-4">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaExclamationTriangle className="text-red-500 text-2xl" />
                    </div>
                    <p className="text-red-400 text-sm mb-3">{error}</p>
                    <button
                      onClick={startWebcam}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm text-white font-medium transition flex items-center gap-2 mx-auto"
                    >
                      <FaRedo size={12} />
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Captured Image */}
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />

                  {/* Face Guide Overlay */}
                  {hasPermission && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Oval Face Guide */}
                      <div
                        className={`w-40 h-52 sm:w-48 sm:h-60 border-4 rounded-full transition-colors duration-300 ${
                          isFaceDetected
                            ? 'border-green-500 shadow-lg shadow-green-500/30'
                            : 'border-yellow-500 animate-pulse'
                        }`}
                      />

                      {/* Status Indicator */}
                      <div
                        className={`absolute bottom-4 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${
                          isFaceDetected
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-black'
                        }`}
                      >
                        {isFaceDetected ? (
                          <>
                            <FaCheck size={12} />
                            Face Detected
                          </>
                        ) : (
                          <>
                            <FaSpinner className="animate-spin" size={12} />
                            Detecting Face...
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Captured Badge */}
              {capturedImage && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                  <FaCheck size={12} />
                  Captured
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-3">
              {capturedImage ? (
                <>
                  <button
                    onClick={handleRetake}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition border border-gray-300"
                  >
                    <FaRedo size={14} />
                    Retake
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition shadow-lg"
                  >
                    <FaCheck size={14} />
                    Save & Continue
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCapture}
                  disabled={!hasPermission || isLoading || !isFaceDetected}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition ${
                    hasPermission && !isLoading && isFaceDetected
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCamera size={14} />
                  Capture Photo
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Instructions (Hidden on small screens) */}
          <div className="hidden lg:flex w-72 flex-col gap-3 flex-shrink-0">
            {/* User Info Card */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold">
                    Face Verification
                  </h3>
                  <p className="text-gray-500 text-sm">Step 1 of 3</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-cyan-600 h-1.5 rounded-full w-1/3" />
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <FaLightbulb className="text-yellow-500" />
                <h4 className="text-gray-800 font-medium">Quick Tips</h4>
              </div>
              <ul className="space-y-2">
                {[
                  'Good lighting on face',
                  'Look directly at camera',
                  'Remove reflective glasses',
                  'Keep neutral expression',
                  'Ensure clear background',
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-gray-600 text-sm"
                  >
                    <span className="w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-cyan-700 text-xs font-medium">
                        {i + 1}
                      </span>
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Status Card */}
            <div
              className={`rounded-xl p-4 border transition-all ${
                capturedImage
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <p
                className={`text-sm flex items-center gap-2 ${
                  capturedImage ? 'text-green-700' : 'text-yellow-700'
                }`}
              >
                {capturedImage ? (
                  <>
                    <FaCheck className="text-green-600" />
                    Photo captured! Click Save & Continue.
                  </>
                ) : (
                  <>⚠️ Position your face and click Capture.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Original Cyan Color */}
      <footer className="bg-cyan-700 py-2 flex-shrink-0">
        <p className="text-center text-white text-sm font-medium">
          © {new Date().getFullYear()} The Online Interview Proctor System
        </p>
      </footer>
    </div>
  );
};

export default InterviewFaceInput;
