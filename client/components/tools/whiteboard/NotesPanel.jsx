import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { HiOutlineLightBulb } from 'react-icons/hi';

const NotesPanel = ({ notes, onNotesChange, onClose }) => {
  return (
    <div className="w-80 border-l bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-amber-100 flex items-center justify-between">
        <span className="font-semibold text-amber-800 flex items-center gap-2">
          <HiOutlineLightBulb /> Interview Notes
        </span>
        <button
          onClick={onClose}
          className="text-amber-600 hover:text-amber-800"
        >
          <FaTimes />
        </button>
      </div>

      {/* Notes Textarea */}
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Private notes about candidate..."
        className="flex-1 p-3 bg-transparent resize-none focus:outline-none text-sm"
      />

      {/* Footer */}
      <div className="p-3 border-t bg-amber-100 text-xs text-amber-700">
        💡 These notes are private and only visible to you.
      </div>
    </div>
  );
};

export default NotesPanel;
