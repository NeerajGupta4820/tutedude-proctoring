import React from 'react';
import { FaTimes, FaCode } from 'react-icons/fa';

const CodeSnippetModal = ({ value, onChange, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-gray-900 rounded-xl p-4 w-[500px] max-w-[90vw]">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-white font-medium flex items-center gap-2">
            <FaCode /> Code Block
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Code Input */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="// Enter your code here..."
          className="w-full h-48 bg-gray-800 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
          autoFocus
        />

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onSubmit}
            className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >
            Add Code
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
