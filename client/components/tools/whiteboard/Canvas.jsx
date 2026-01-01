import React, { forwardRef } from 'react';
import { getCursorStyle } from '../../../utlis/canvasHelpers';

const Canvas = forwardRef(
  (
    {
      tool,
      isLocked,
      isInterviewer,
      isPanning,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    ref
  ) => {
    const cursorStyle = getCursorStyle(
      tool,
      isLocked,
      isInterviewer,
      isPanning
    );

    return (
      <canvas
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="absolute inset-0 bg-white shadow-lg"
        style={{ cursor: cursorStyle }}
      />
    );
  }
);

Canvas.displayName = 'Canvas';

export default Canvas;
