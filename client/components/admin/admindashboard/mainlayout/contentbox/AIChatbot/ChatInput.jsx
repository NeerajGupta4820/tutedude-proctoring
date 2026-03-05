// components/AIChatbot/ChatInput.jsx
import React, { useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const ChatInput = ({ value, onChange, onSend, isLoading }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t-2 border-dashed border-gray-200 px-6 py-4 shadow-lg">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about interviews, candidate analysis, questions, or reports..."
            className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px', height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 font-semibold shadow-md ${
            value.trim() && !isLoading
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" size={14} />
          ) : (
            <FaPaperPlane size={14} />
          )}
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-3 text-center font-medium">
        💡 AI can make mistakes. Always verify important information before
        using.
      </p>
    </div>
  );
};

export default ChatInput;
