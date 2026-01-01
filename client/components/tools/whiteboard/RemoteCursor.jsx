import React from 'react';

const RemoteCursor = ({ cursor }) => {
  return (
    <div
      className="absolute pointer-events-none transition-all duration-75"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: 'translate(-2px, -2px)',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5.65 2.35L20.35 12.65L12.65 14.35L8.65 21.65L5.65 2.35Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <span
        className="absolute left-5 top-4 text-xs font-medium px-2 py-0.5 rounded-full text-white whitespace-nowrap"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.name}
      </span>
    </div>
  );
};

export default RemoteCursor;
