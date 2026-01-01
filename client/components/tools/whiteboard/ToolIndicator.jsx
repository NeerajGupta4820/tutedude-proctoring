// components/ToolIndicator.jsx
import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import { ALL_TOOLS } from '../../../constants/tools';

const ToolIndicator = ({ tool, color, lineWidth }) => {
  const currentTool = ALL_TOOLS.find((t) => t.id === tool);

  return (
    <>
      {/* Tool Info */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: color }}
        />
        <div className="h-4 w-px bg-gray-300" />
        <span className="text-sm font-semibold text-gray-700 capitalize">
          {currentTool?.name || tool}
        </span>
        <div className="h-4 w-px bg-gray-300" />
        <span className="text-xs text-gray-500 font-mono">{lineWidth}px</span>
      </div>

      {/* Keyboard Hints */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <FaKeyboard size={12} />
          Ctrl+Z: Undo | Ctrl+S: Save
        </span>
      </div>
    </>
  );
};

export default ToolIndicator;
