import React from 'react';
import { BRUSH_SIZES } from '../../../constants/colors';

const BrushSizeSelector = ({ lineWidth, onSizeChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border">
      <span className="text-xs text-gray-500 font-medium">Size:</span>

      {/* Quick size buttons */}
      {BRUSH_SIZES.slice(0, 4).map((size) => (
        <button
          key={size}
          onClick={() => onSizeChange(size)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            lineWidth === size
              ? 'bg-orange-500 text-white'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={`${size}px`}
        >
          <div
            className="rounded-full bg-current"
            style={{
              width: Math.min(size * 1.5 + 2, 16),
              height: Math.min(size * 1.5 + 2, 16),
            }}
          />
        </button>
      ))}

      {/* Range slider */}
      <input
        type="range"
        min="1"
        max="32"
        value={lineWidth}
        onChange={(e) => onSizeChange(parseInt(e.target.value))}
        className="w-16 accent-orange-500 cursor-pointer"
      />

      {/* Current size display */}
      <span className="text-xs text-gray-600 font-mono w-8">{lineWidth}px</span>
    </div>
  );
};

export default BrushSizeSelector;
