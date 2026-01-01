import React from 'react';
import {
  FaUndo,
  FaRedo,
  FaDownload,
  FaTrash,
  FaPalette,
  FaFill,
} from 'react-icons/fa';
import { HiOutlineLightBulb } from 'react-icons/hi';
import ToolButton from './ToolButton';
import BrushSizeSelector from './BrushSizeSelector';
import {
  DRAWING_TOOLS,
  SHAPE_TOOLS,
  TEXT_TOOLS,
} from '../../../constants/tools';

const Toolbar = ({
  tool,
  color,
  fillColor,
  lineWidth,
  canUndo,
  canRedo,
  showColorPicker,
  showFillPicker,
  showNotes,
  isInterviewer,
  colorButtonRef,
  fillButtonRef,
  onToolChange,
  onLineWidthChange,
  onColorPickerToggle,
  onFillPickerToggle,
  onUndo,
  onRedo,
  onDownload,
  onClear,
  onToggleNotes,
}) => {
  return (
    <div className="p-2 border-b bg-gray-50 flex-shrink-0 overflow-x-auto relative z-20">
      <div className="flex items-center gap-2 min-w-max">
        {/* Drawing Tools */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm border">
          {DRAWING_TOOLS.map((t) => (
            <ToolButton
              key={t.id}
              tool={t}
              isActive={tool === t.id}
              onClick={onToolChange}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Shape Tools */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm border">
          {SHAPE_TOOLS.map((t) => (
            <ToolButton
              key={t.id}
              tool={t}
              isActive={tool === t.id}
              onClick={onToolChange}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Text Tools */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm border">
          {TEXT_TOOLS.map((t) => (
            <ToolButton
              key={t.id}
              tool={t}
              isActive={tool === t.id}
              onClick={onToolChange}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Stroke Color Button */}
        <button
          ref={colorButtonRef}
          onClick={onColorPickerToggle}
          className={`flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors ${
            showColorPicker ? 'ring-2 ring-orange-400' : ''
          }`}
          title="Stroke Color"
        >
          <div
            className="w-6 h-6 rounded-md border-2 border-gray-300 shadow-inner"
            style={{ backgroundColor: color }}
          />
          <FaPalette className="text-gray-500" size={14} />
        </button>

        {/* Fill Color Button */}
        <button
          ref={fillButtonRef}
          onClick={onFillPickerToggle}
          className={`flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors ${
            showFillPicker ? 'ring-2 ring-orange-400' : ''
          }`}
          title="Fill Color"
        >
          <div
            className="w-6 h-6 rounded-md border-2 border-gray-300 relative overflow-hidden"
            style={{
              backgroundColor:
                fillColor === 'transparent' ? 'white' : fillColor,
            }}
          >
            {fillColor === 'transparent' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-red-500 rotate-45 transform origin-center" />
              </div>
            )}
          </div>
          <FaFill className="text-gray-500" size={14} />
        </button>

        <div className="w-px h-8 bg-gray-300" />

        {/* Brush Size */}
        <BrushSizeSelector
          lineWidth={lineWidth}
          onSizeChange={onLineWidthChange}
        />

        <div className="w-px h-8 bg-gray-300" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all ${
              !canUndo
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <FaUndo size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all ${
              !canRedo
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <FaRedo size={16} />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Download & Clear */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDownload}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            title="Download (Ctrl+S)"
          >
            <FaDownload size={16} />
          </button>
          <button
            onClick={onClear}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            title="Clear All"
          >
            <FaTrash size={16} />
          </button>
        </div>

        {/* Notes Button (Interviewer only) */}
        {isInterviewer && (
          <>
            <div className="w-px h-8 bg-gray-300" />
            <button
              onClick={onToggleNotes}
              className={`p-2 rounded-lg transition-colors shadow-sm ${
                showNotes
                  ? 'bg-amber-500 text-white'
                  : 'bg-white border hover:bg-amber-50 text-amber-600'
              }`}
              title="Interview Notes"
            >
              <HiOutlineLightBulb size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
