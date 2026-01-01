import React from 'react';
import { FaTimes } from 'react-icons/fa';

const StickyNote = ({
  note,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  return (
    <div
      className={`absolute shadow-lg rounded-lg cursor-move ${
        isSelected ? 'ring-2 ring-orange-500' : ''
      }`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        minHeight: note.height,
        backgroundColor: note.color,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={() => onSelect(index)}
    >
      {/* Header */}
      <div className="p-2 flex justify-between items-start border-b border-black/10">
        <span className="text-xs font-semibold text-gray-700">
          Note {index + 1}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          className="text-gray-500 hover:text-red-500"
        >
          <FaTimes size={12} />
        </button>
      </div>

      {/* Content */}
      <textarea
        value={note.text}
        onChange={(e) => onUpdate(index, { text: e.target.value })}
        placeholder="Add note..."
        className="w-full p-2 bg-transparent resize-none text-sm focus:outline-none"
        style={{ minHeight: note.height - 40 }}
      />
    </div>
  );
};

export default StickyNote;
