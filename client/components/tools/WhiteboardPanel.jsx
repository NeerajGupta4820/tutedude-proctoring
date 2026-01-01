// WhiteboardPanel.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaLock } from 'react-icons/fa';

// Components
import {
  Header,
  Toolbar,
  Canvas,
  ColorPicker,
  TextInput,
  StickyNote,
  RemoteCursor,
  ToolIndicator,
  NotesPanel,
  CodeSnippetModal,
} from './whiteboard';

// Hooks
import { useCanvasHistory } from '../../hooks/useCanvasHistory';
import { useSocketEvents } from '../../hooks/useSocketEvents';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

// Utils & Constants
import {
  getCanvasCoords,
  drawLine,
  drawShapeOnContext,
  drawText,
  drawCodeBlock,
  clearCanvasWithWhite,
} from '../../utlis/canvasHelpers';
import { SHAPE_TOOL_IDS, FREEHAND_TOOL_IDS } from '../../constants/tools';

const WhiteboardPanel = ({
  onClose,
  meetingId,
  socket,
  isInterviewer = false,
  userName = 'User',
}) => {
  // ========================================
  // REFS
  // ========================================
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const colorPickerRef = useRef(null);
  const fillPickerRef = useRef(null);
  const colorButtonRef = useRef(null);
  const fillButtonRef = useRef(null);

  // ========================================
  // DRAWING STATES
  // ========================================
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // ========================================
  // TEXT STATES
  // ========================================
  const [isTyping, setIsTyping] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [currentText, setCurrentText] = useState('');
  const [fontSize] = useState(18);
  const [fontFamily] = useState('Arial');

  // ========================================
  // UI STATES
  // ========================================
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFillPicker, setShowFillPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const [fillPickerPosition, setFillPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // ========================================
  // COLLABORATION STATES
  // ========================================
  const [isLocked, setIsLocked] = useState(false);
  const [showCursors, setShowCursors] = useState(true);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [activeUsers] = useState([]);

  // ========================================
  // INTERVIEW STATES
  // ========================================
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [stickyNotes, setStickyNotes] = useState([]);
  const [selectedStickyNote, setSelectedStickyNote] = useState(null);

  // ========================================
  // CUSTOM HOOKS
  // ========================================
  const {
    history,
    historyIndex,
    saveToHistory,
    handleUndo,
    handleRedo,
    initializeHistory,
    loadFromHistory,
    canUndo,
    canRedo,
  } = useCanvasHistory(canvasRef, socket, meetingId);

  const {
    emitDraw,
    emitShape,
    emitText,
    emitClear,
    emitCursor,
    emitLock,
    emitSticky,
  } = useSocketEvents({
    socket,
    meetingId,
    canvasRef,
    setRemoteCursors,
    setIsLocked,
    setStickyNotes,
  });

  // ========================================
  // COMMIT TEXT HELPER
  // ========================================
  const commitText = useCallback(() => {
    if (currentText.trim()) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawText(ctx, textPosition, currentText, color, fontSize, fontFamily);
      }

      emitText({
        position: textPosition,
        text: currentText,
        color,
        fontSize,
        fontFamily,
      });

      saveToHistory();
    }
    setCurrentText('');
  }, [
    currentText,
    textPosition,
    color,
    fontSize,
    fontFamily,
    emitText,
    saveToHistory,
  ]);

  // ========================================
  // DOWNLOAD HANDLER
  // ========================================
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }
  }, []);

  // ========================================
  // KEYBOARD SHORTCUTS HOOK
  // ========================================
  useKeyboardShortcuts({
    isTyping,
    setTool,
    handleUndo,
    handleRedo,
    handleDownload,
    commitText,
    setIsTyping,
    setShowColorPicker,
    setShowFillPicker,
  });

  // ========================================
  // CLICK OUTSIDE HANDLER
  // ========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target) &&
        colorButtonRef.current &&
        !colorButtonRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
      if (
        fillPickerRef.current &&
        !fillPickerRef.current.contains(event.target) &&
        fillButtonRef.current &&
        !fillButtonRef.current.contains(event.target)
      ) {
        setShowFillPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========================================
  // INITIALIZE CANVAS
  // ========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    const container = containerRef.current;

    if (canvas && container && tempCanvas) {
      const updateCanvasSize = () => {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!loadFromHistory() && history.length === 0) {
          initializeHistory(canvas.toDataURL());
        }
      };

      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }
  }, [isFullscreen, loadFromHistory, initializeHistory, history.length]);

  // ========================================
  // CANVAS COORDINATE HELPER
  // ========================================
  const getCoords = useCallback((e) => {
    return getCanvasCoords(e, canvasRef.current);
  }, []);

  // ========================================
  // EMIT CURSOR POSITION
  // ========================================
  const handleEmitCursor = useCallback(
    (pos) => {
      if (showCursors) {
        emitCursor({ x: pos.x, y: pos.y, name: userName, color });
      }
    },
    [showCursors, emitCursor, userName, color]
  );

  // ========================================
  // START DRAWING
  // ========================================
  const startDrawing = useCallback(
    (e) => {
      if (isLocked && !isInterviewer) return;
      e.preventDefault();

      setShowColorPicker(false);
      setShowFillPicker(false);

      if (isTyping && currentText) {
        commitText();
      }

      const pos = getCoords(e);
      handleEmitCursor(pos);

      // Pan tool
      if (tool === 'pan') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }

      // Text tool
      if (tool === 'text') {
        if (isTyping && currentText) {
          commitText();
        }
        setTextPosition(pos);
        setCurrentText('');
        setIsTyping(true);
        return;
      }

      // Sticky Note tool
      if (tool === 'stickyNote') {
        const newNote = {
          x: pos.x,
          y: pos.y,
          text: '',
          color: '#FFEAA7',
          width: 200,
          height: 150,
        };
        setStickyNotes((prev) => [...prev, newNote]);
        setSelectedStickyNote(stickyNotes.length);
        emitSticky({ action: 'add', note: newNote });
        return;
      }

      // Code Block tool
      if (tool === 'codeBlock') {
        setTextPosition(pos);
        setShowCodeSnippet(true);
        return;
      }

      setIsTyping(false);
      setIsDrawing(true);
      setStartPos(pos);

      const canvas = canvasRef.current;
      if (canvas && FREEHAND_TOOL_IDS.includes(tool)) {
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    },
    [
      isLocked,
      isInterviewer,
      isTyping,
      currentText,
      tool,
      pan,
      getCoords,
      handleEmitCursor,
      commitText,
      stickyNotes.length,
      emitSticky,
    ]
  );

  // ========================================
  // DRAW
  // ========================================
  const draw = useCallback(
    (e) => {
      e.preventDefault();
      const pos = getCoords(e);
      handleEmitCursor(pos);

      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }

      if (!isDrawing) return;
      if (isLocked && !isInterviewer) return;

      const canvas = canvasRef.current;
      const tempCanvas = tempCanvasRef.current;
      if (!canvas || !tempCanvas) return;

      const ctx = canvas.getContext('2d');
      const tempCtx = tempCanvas.getContext('2d');

      // Pen or Eraser
      if (['pen', 'eraser'].includes(tool)) {
        const drawColor = tool === 'eraser' ? '#ffffff' : color;
        const drawWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;

        ctx.globalAlpha = 1;
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = drawWidth;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        emitDraw({
          from: startPos,
          to: pos,
          color: drawColor,
          lineWidth: drawWidth,
          tool,
          opacity: 1,
        });
        setStartPos(pos);
      }
      // Highlighter
      else if (tool === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * 3;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        emitDraw({
          from: startPos,
          to: pos,
          color,
          lineWidth: lineWidth * 3,
          tool,
          opacity: 0.3,
        });
        setStartPos(pos);
      }
      // Shapes
      else if (SHAPE_TOOL_IDS.includes(tool)) {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        drawShapeOnContext(
          tempCtx,
          tool,
          startPos,
          pos,
          color,
          lineWidth,
          fillColor
        );
      }
    },
    [
      getCoords,
      handleEmitCursor,
      isPanning,
      panStart,
      isDrawing,
      isLocked,
      isInterviewer,
      tool,
      color,
      lineWidth,
      fillColor,
      startPos,
      emitDraw,
    ]
  );

  // ========================================
  // STOP DRAWING
  // ========================================
  const stopDrawing = useCallback(
    (e) => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (!isDrawing) return;

      const pos = e ? getCoords(e) : startPos;
      const tempCanvas = tempCanvasRef.current;
      const canvas = canvasRef.current;

      if (tempCanvas && canvas && SHAPE_TOOL_IDS.includes(tool)) {
        const tempCtx = tempCanvas.getContext('2d');
        const ctx = canvas.getContext('2d');

        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        drawShapeOnContext(
          ctx,
          tool,
          startPos,
          pos,
          color,
          lineWidth,
          fillColor
        );

        emitShape({
          shape: tool,
          startPos,
          endPos: pos,
          color,
          lineWidth,
          fillColor,
        });
      }

      setIsDrawing(false);
      saveToHistory();
    },
    [
      isPanning,
      isDrawing,
      getCoords,
      startPos,
      tool,
      color,
      lineWidth,
      fillColor,
      emitShape,
      saveToHistory,
    ]
  );

  // ========================================
  // CLEAR CANVAS
  // ========================================
  const clearCanvas = useCallback(() => {
    clearCanvasWithWhite(canvasRef.current);
    setStickyNotes([]);
    emitClear();
    saveToHistory();
  }, [emitClear, saveToHistory]);

  // ========================================
  // COLOR PICKER HANDLERS
  // ========================================
  const handleColorPickerToggle = (e) => {
    e.stopPropagation();
    setShowFillPicker(false);
    if (!showColorPicker && colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      setColorPickerPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setShowColorPicker(!showColorPicker);
  };

  const handleFillPickerToggle = (e) => {
    e.stopPropagation();
    setShowColorPicker(false);
    if (!showFillPicker && fillButtonRef.current) {
      const rect = fillButtonRef.current.getBoundingClientRect();
      setFillPickerPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setShowFillPicker(!showFillPicker);
  };

  const handleColorSelect = (selectedColor) => {
    setColor(selectedColor);
    setShowColorPicker(false);
  };

  const handleFillColorSelect = (selectedColor) => {
    setFillColor(selectedColor);
    setShowFillPicker(false);
  };

  // ========================================
  // ZOOM HANDLERS
  // ========================================
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // ========================================
  // LOCK TOGGLE
  // ========================================
  const toggleLock = () => {
    if (isInterviewer) {
      const newLocked = !isLocked;
      setIsLocked(newLocked);
      emitLock(newLocked);
    }
  };

  // ========================================
  // STICKY NOTE HANDLERS
  // ========================================
  const updateStickyNote = (index, updates) => {
    const updatedNote = { ...stickyNotes[index], ...updates };
    setStickyNotes((prev) =>
      prev.map((note, i) => (i === index ? updatedNote : note))
    );
    emitSticky({ action: 'update', index, note: updatedNote });
  };

  const deleteStickyNote = (index) => {
    setStickyNotes((prev) => prev.filter((_, i) => i !== index));
    setSelectedStickyNote(null);
    emitSticky({ action: 'delete', index });
  };

  // ========================================
  // CODE SNIPPET HANDLER
  // ========================================
  const handleCodeSubmit = () => {
    if (codeSnippet.trim()) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawCodeBlock(ctx, textPosition, codeSnippet);
      }
      saveToHistory();
    }
    setShowCodeSnippet(false);
    setCodeSnippet('');
  };

  // ========================================
  // TEXT INPUT HANDLERS
  // ========================================
  const handleTextBlur = () => {
    if (currentText) commitText();
    setIsTyping(false);
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitText();
      setIsTyping(false);
    }
    if (e.key === 'Escape') {
      setCurrentText('');
      setIsTyping(false);
    }
  };

  // ========================================
  // CONTAINER CLASSES
  // ========================================
  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-[9999] bg-white flex flex-col'
    : 'w-full h-full bg-white shadow-lg flex flex-col rounded-lg overflow-hidden';

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={containerClasses}>
      {/* ==================== HEADER ==================== */}
      <Header
        activeUsers={activeUsers}
        isLocked={isLocked}
        zoom={zoom}
        showGrid={showGrid}
        showCursors={showCursors}
        isFullscreen={isFullscreen}
        isInterviewer={isInterviewer}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleCursors={() => setShowCursors(!showCursors)}
        onToggleLock={toggleLock}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onClose={onClose}
      />

      {/* ==================== TOOLBAR ==================== */}
      <Toolbar
        tool={tool}
        color={color}
        fillColor={fillColor}
        lineWidth={lineWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        showColorPicker={showColorPicker}
        showFillPicker={showFillPicker}
        showNotes={showNotes}
        isInterviewer={isInterviewer}
        colorButtonRef={colorButtonRef}
        fillButtonRef={fillButtonRef}
        onToolChange={setTool}
        onLineWidthChange={setLineWidth}
        onColorPickerToggle={handleColorPickerToggle}
        onFillPickerToggle={handleFillPickerToggle}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDownload={handleDownload}
        onClear={clearCanvas}
        onToggleNotes={() => setShowNotes(!showNotes)}
      />

      {/* ==================== CANVAS CONTAINER ==================== */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          style={{
            backgroundColor: '#f8fafc',
            backgroundImage: showGrid
              ? 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)'
              : 'none',
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        >
          {/* Main Canvas */}
          <Canvas
            ref={canvasRef}
            tool={tool}
            isLocked={isLocked}
            isInterviewer={isInterviewer}
            isPanning={isPanning}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Temp Canvas for shape preview */}
          <canvas
            ref={tempCanvasRef}
            className="absolute inset-0 pointer-events-none"
          />

          {/* Text Input */}
          {isTyping && tool === 'text' && (
            <TextInput
              position={textPosition}
              value={currentText}
              onChange={setCurrentText}
              onBlur={handleTextBlur}
              onKeyDown={handleTextKeyDown}
              color={color}
              fontSize={fontSize}
              fontFamily={fontFamily}
            />
          )}

          {/* Sticky Notes */}
          {stickyNotes.map((note, index) => (
            <StickyNote
              key={index}
              note={note}
              index={index}
              isSelected={selectedStickyNote === index}
              onSelect={setSelectedStickyNote}
              onUpdate={updateStickyNote}
              onDelete={deleteStickyNote}
            />
          ))}

          {/* Remote Cursors */}
          {showCursors &&
            Object.entries(remoteCursors).map(([socketId, cursor]) => (
              <RemoteCursor key={socketId} cursor={cursor} />
            ))}

          {/* Tool Indicator */}
          <ToolIndicator tool={tool} color={color} lineWidth={lineWidth} />

          {/* Locked Indicator */}
          {isLocked && !isInterviewer && (
            <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3">
                <FaLock className="text-yellow-500 text-xl" />
                <span className="text-gray-700 font-medium">
                  Whiteboard is locked by interviewer
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notes Panel */}
        {showNotes && isInterviewer && (
          <NotesPanel
            notes={notes}
            onNotesChange={setNotes}
            onClose={() => setShowNotes(false)}
          />
        )}
      </div>

      {/* ==================== COLOR PICKER (STROKE) ==================== */}
      {showColorPicker && (
        <ColorPicker
          pickerRef={colorPickerRef}
          position={colorPickerPosition}
          title="Stroke Color"
          selectedColor={color}
          onColorSelect={handleColorSelect}
          onClose={() => setShowColorPicker(false)}
          showNoFill={false}
        />
      )}

      {/* ==================== COLOR PICKER (FILL) ==================== */}
      {showFillPicker && (
        <ColorPicker
          pickerRef={fillPickerRef}
          position={fillPickerPosition}
          title="Fill Color"
          selectedColor={fillColor}
          onColorSelect={handleFillColorSelect}
          onClose={() => setShowFillPicker(false)}
          showNoFill={true}
        />
      )}

      {/* ==================== CODE SNIPPET MODAL ==================== */}
      {showCodeSnippet && (
        <CodeSnippetModal
          value={codeSnippet}
          onChange={setCodeSnippet}
          onSubmit={handleCodeSubmit}
          onClose={() => {
            setShowCodeSnippet(false);
            setCodeSnippet('');
          }}
        />
      )}
    </div>
  );
};

export default WhiteboardPanel;
