import React from 'react';

const ToolButton = ({ tool, isActive, onClick }) => {
  const Icon = tool.icon;

  return (
    <button
      onClick={() => onClick(tool.id)}
      className={`p-2 rounded-lg transition-all ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      title={`${tool.name} (${tool.shortcut})`}
    >
      <Icon size={16} />
    </button>
  );
};

export default ToolButton;
