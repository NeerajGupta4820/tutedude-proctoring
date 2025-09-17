import React from 'react';
import { Link } from 'react-router-dom';

const interviewSystemCheckError = () => (
  <div className="min-h-screen bg-gray-200 flex flex-col">
    <nav className="bg-cyan-700 h-14 flex items-center px-8 mb-12">
      <Link to="/" className="font-bold text-lg tracking-wide text-white">
        The Online Interview Proctor
      </Link>
      <a href="/" className="ml-auto font-bold text-black hover:underline">Logout</a>
    </nav>
    <div className="flex flex-col md:flex-row items-center justify-center flex-1 w-full">
      <img src="../assets/error.png" alt="error" className="w-64 h-64 mb-6 md:mb-0 md:mr-8" />
      <div className="flex-1 flex flex-col items-center md:items-start">
        <h1 className="flex items-center text-3xl font-bold text-cyan-700 mb-6 animate-pulse">
          <img src="../assets/error2.png" alt="error1" className="w-10 h-10 mr-2" />
          System Compatibility Error
          <img src="../assets/error2.png" alt="error2" className="w-10 h-10 ml-2" />
        </h1>
        <div className="bg-gray-200 border-4 border-cyan-700 rounded-2xl shadow-lg p-6 max-w-xl text-center">
          <p className="text-lg text-black">
            Sorry, your computer is not compatible with taking the online interview. Please use a computer with a webcam and voice recorder. If you have any questions, please contact the interview administrator.
          </p>
        </div>
      </div>
    </div>
    <footer className="bg-cyan-700 text-black text-center py-3 font-bold mt-12">
      &copy; The Online interview Proctor System
    </footer>
  </div>
);

export default interviewSystemCheckError;
