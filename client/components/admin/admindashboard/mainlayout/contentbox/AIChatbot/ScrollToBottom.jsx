// components/AIChatbot/ScrollToBottom.jsx
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const ScrollToBottom = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-2 hover:bg-indigo-700 transition-all duration-200 text-sm font-medium z-10"
    >
      <FaChevronDown size={12} />
      <span>New messages</span>
    </button>
  );
};

export default ScrollToBottom;
