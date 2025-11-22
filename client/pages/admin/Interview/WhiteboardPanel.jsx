import React, { useRef, useState, useEffect } from 'react';
import { FaEraser, FaPen, FaUndo, FaTrash } from 'react-icons/fa';

const WhiteboardPanel = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen'); // pen, eraser

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.strokeStyle = tool === 'eraser' ? '#1f2937' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Tools */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setTool('pen')}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <FaPen /> Pen
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <FaEraser /> Eraser
        </button>
        
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-12 h-10 rounded cursor-pointer"
          disabled={tool === 'eraser'}
        />
        
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(parseInt(e.target.value))}
          className="w-24"
          disabled={tool === 'eraser'}
        />
        
        <button
          onClick={clearCanvas}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
        >
          <FaTrash /> Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 overflow-auto">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border border-gray-700 rounded cursor-crosshair"
        />
      </div>
    </div>
  );
};

export default WhiteboardPanel;