import React from 'react';
import { COLORS } from '../../../constants/colors';

const ColorPicker = ({
  pickerRef,
  position,
  title,
  selectedColor,
  onColorSelect,
  onClose,
  showNoFill = false,
}) => {
  return (
    <div
      ref={pickerRef}
      className="fixed p-4 bg-white rounded-xl shadow-2xl border z-[99999]"
      style={{
        top: position.top,
        left: position.left,
        width: '288px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
        {title}
      </p>

      {/* No Fill Button (for fill color picker) */}
      {showNoFill && (
        <button
          onClick={() => onColorSelect('transparent')}
          className={`w-full p-3 mb-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            selectedColor === 'transparent'
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="w-5 h-5 rounded border-2 border-gray-300 relative overflow-hidden bg-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-red-500 rotate-45" />
            </div>
          </div>
          No Fill (Transparent)
        </button>
      )}

      {/* Color Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorSelect(c)}
            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md ${
              selectedColor === c
                ? 'border-orange-500 ring-2 ring-orange-300 scale-110 shadow-md'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Custom:</span>
        <input
          type="color"
          value={selectedColor === 'transparent' ? '#ffffff' : selectedColor}
          onChange={(e) => onColorSelect(e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-200"
        />
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Selected: {selectedColor === 'transparent' ? 'None' : selectedColor}
        </span>
        <button
          onClick={onClose}
          className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
