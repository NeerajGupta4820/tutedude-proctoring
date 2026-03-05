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
    onSend(value.trim()); // ✅ FIX: Pass value directly
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(); // ✅ FIX: Use handleSend
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3 shadow-lg">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about interviews, cheating reports, or candidate analysis..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
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
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            value.trim() && !isLoading
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" size={14} />
          ) : (
            <FaPaperPlane size={14} />
          )}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center">
        AI can make mistakes. Always verify important information.
      </p>
    </div>
  );
};

export default ChatInput;
