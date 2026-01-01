import React, { useRef, useEffect } from 'react';

const TextInput = ({
  position,
  value,
  onChange,
  onBlur,
  onKeyDown,
  color,
  fontSize,
  fontFamily,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div
      className="absolute"
      style={{ left: position.x, top: position.y - fontSize }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="bg-transparent border-none outline-none min-w-[100px] px-1"
        style={{ color, fontSize: `${fontSize}px`, fontFamily }}
        placeholder="Type here..."
        autoFocus
      />
      <div className="h-0.5 bg-orange-500 animate-pulse" />
    </div>
  );
};

export default TextInput;
