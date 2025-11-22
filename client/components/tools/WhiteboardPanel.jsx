import React, { useRef, useState, useEffect } from 'react';
import { FaTimes, FaEraser, FaPen, FaUndo, FaTrash } from 'react-icons/fa';

const WhiteboardPanel = ({ onClose, meetingId, socket }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // Listen for drawing from other participants
    if (socket) {
      socket.on('whiteboard-draw', ({ from, to, color, lineWidth, tool }) => {
        drawLine(from, to, color, lineWidth, tool);
      });

      socket.on('whiteboard-clear', () => {
        clearCanvas();
      });
    }

    return () => {
      if (socket) {
        socket.off('whiteboard-draw');
        socket.off('whiteboard-clear');
      }
    };
  }, [socket]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();

    // Emit drawing to other participants
    if (socket) {
      socket.emit('whiteboard-draw', {
        meetingId,
        from: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        to: { x, y },
        color: tool === 'eraser' ? '#ffffff' : color,
        lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth,
        tool,
      });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const drawLine = (from, to, drawColor, drawLineWidth, drawTool) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawLineWidth;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    clearCanvas();
    if (socket) {
      socket.emit('whiteboard-clear', { meetingId });
    }
  };

  return (
    <div className="w-2/5 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-orange-500 text-white">
        <h2 className="text-xl font-bold">Whiteboard</h2>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b bg-gray-100 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded ${tool === 'pen' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          title="Pen"
        >
          <FaPen />
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded ${tool === 'eraser' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          title="Eraser"
        >
          <FaEraser />
        </button>
        
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer"
          title="Color"
        />
        
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          className="w-24"
          title="Line Width"
        />
        
        <button
          onClick={handleClear}
          className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
          title="Clear All"
        >
          <FaTrash />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border border-gray-300 bg-white cursor-crosshair w-full h-full"
        />
      </div>
    </div>
  );
};

export default WhiteboardPanel;