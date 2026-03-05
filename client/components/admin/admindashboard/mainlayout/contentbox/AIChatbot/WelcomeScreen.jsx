// components/AIChatbot/WelcomeScreen.jsx
import React from 'react';
import {
  FaRobot,
  FaShieldAlt,
  FaChartBar,
  FaUserCheck,
  FaLightbulb,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const QUICK_SUGGESTIONS = [
  {
    text: 'Cheating reports & patterns',
    icon: FaShieldAlt,
    color: 'from-red-500 to-rose-600',
  },
  {
    text: 'Interview statistics',
    icon: FaChartBar,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    text: 'Top candidates',
    icon: FaUserCheck,
    color: 'from-emerald-500 to-green-600',
  },
  {
    text: 'Suggest questions',
    icon: FaLightbulb,
    color: 'from-amber-500 to-orange-600',
  },
];

const WelcomeScreen = ({ onSendMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
          <FaRobot className="text-white text-4xl" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <HiSparkles className="text-white text-lg" />
        </div>
      </div>

      <h3 className="text-gray-900 font-bold text-2xl mb-3">
        Welcome to AI Interview Assistant
      </h3>
      <p className="text-gray-600 text-base mb-10 max-w-lg font-medium">
        Analyze interviews, detect patterns, generate reports, and evaluate
        candidates with AI-powered insights.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {QUICK_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(suggestion.text)}
            className="group flex items-center gap-4 bg-white border-2 border-dashed border-gray-200 rounded-xy px-5 py-4 text-left hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 transform hover:scale-105"
          >
            <div
              className={`w-12 h-12 bg-gradient-to-br ${suggestion.color} rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0`}
            >
              <suggestion.icon size={20} />
            </div>
            <span className="text-gray-700 text-sm font-bold group-hover:text-gray-900 transition-colors">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl max-w-lg">
        <p className="text-xs text-blue-700 font-semibold">
          💡 Pro Tip: Ask specific questions about interviews, candidates, or
          reports for better analysis.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
