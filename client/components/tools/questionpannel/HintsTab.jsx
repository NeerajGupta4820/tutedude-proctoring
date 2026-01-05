import React, { useState } from 'react';
import { FaLightbulb, FaChevronDown } from 'react-icons/fa';

const HintsTab = ({ hints, t }) => {
  const [openHint, setOpenHint] = useState(null);

  if (!hints?.length) {
    return (
      <div className={`flex items-center justify-center h-48 ${t.textMuted}`}>
        <div className="text-center">
          <FaLightbulb className="text-4xl mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hints available</p>
          <p className="text-sm mt-1">Try solving without hints first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hints.map((hint, idx) => (
        <HintItem
          key={idx}
          hint={hint}
          index={idx}
          isOpen={openHint === idx}
          onToggle={() => setOpenHint(openHint === idx ? null : idx)}
          t={t}
        />
      ))}
    </div>
  );
};

// Hint Item Component
const HintItem = ({ hint, index, isOpen, onToggle, t }) => (
  <div
    className={`border ${t.border} rounded-xl overflow-hidden transition-all ${
      isOpen ? t.accentBg : t.bg
    }`}
  >
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 ${t.buttonHover} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${t.warningBg}`}
        >
          <FaLightbulb className={t.warningText} size={14} />
        </div>
        <span className={`font-medium ${t.text}`}>
          Hint {hint.level || index + 1}
        </span>
      </div>
      <div
        className={`transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      >
        <FaChevronDown className={t.textMuted} size={12} />
      </div>
    </button>

    {isOpen && (
      <div
        className={`px-4 pb-4 ${t.textSecondary} border-t ${t.border} pt-4 mx-4 mb-4`}
      >
        <p className="leading-relaxed">{hint.text || hint.content || hint}</p>
      </div>
    )}
  </div>
);

export default HintsTab;
