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
    text: 'Cheating report — last week',
    icon: FaShieldAlt,
    color: 'from-red-500 to-rose-600',
  },
  {
    text: 'Overall interview stats',
    icon: FaChartBar,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    text: 'Top performing candidates',
    icon: FaUserCheck,
    color: 'from-emerald-500 to-green-600',
  },
  {
    text: 'Suggest interview questions',
    icon: FaLightbulb,
    color: 'from-amber-500 to-orange-600',
  },
];

const WelcomeScreen = ({ onSendMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse">
          <FaRobot className="text-white text-3xl" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <HiSparkles className="text-white text-xs" />
        </div>
      </div>

      <h3 className="text-slate-800 font-bold text-xl mb-2">
        Hi! I'm your AI Interview Assistant
      </h3>
      <p className="text-slate-500 text-sm mb-8 max-w-md">
        I can analyze interviews, detect cheating patterns, generate reports,
        and help you with candidate evaluations. Ask me anything!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {QUICK_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(suggestion.text)}
            className="group flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-left hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200"
          >
            <div
              className={`w-9 h-9 bg-gradient-to-br ${suggestion.color} rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0`}
            >
              <suggestion.icon size={14} />
            </div>
            <span className="text-slate-600 text-sm font-medium group-hover:text-slate-800 transition-colors">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
