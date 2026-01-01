// constants/tools.js
import {
  FaMousePointer,
  FaHandPaper,
  FaPen,
  FaHighlighter,
  FaEraser,
  FaMinus,
  FaArrowRight,
  FaFont,
  FaCode,
  FaStickyNote,
  FaProjectDiagram,
  FaTable,
  FaCheckSquare,
  FaListOl,
} from 'react-icons/fa';
import { BiRectangle } from 'react-icons/bi';
import { IoTriangleOutline, IoEllipseOutline } from 'react-icons/io5';
import { BsDiamond } from 'react-icons/bs';

export const DRAWING_TOOLS = [
  { id: 'select', icon: FaMousePointer, name: 'Select', shortcut: 'V' },
  { id: 'pan', icon: FaHandPaper, name: 'Pan', shortcut: 'H' },
  { id: 'pen', icon: FaPen, name: 'Pen', shortcut: 'P' },
  {
    id: 'highlighter',
    icon: FaHighlighter,
    name: 'Highlighter',
    shortcut: 'M',
  },
  { id: 'eraser', icon: FaEraser, name: 'Eraser', shortcut: 'E' },
];

export const SHAPE_TOOLS = [
  { id: 'line', icon: FaMinus, name: 'Line', shortcut: 'L' },
  { id: 'arrow', icon: FaArrowRight, name: 'Arrow', shortcut: 'A' },
  { id: 'rectangle', icon: BiRectangle, name: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: IoEllipseOutline, name: 'Ellipse', shortcut: 'O' },
  { id: 'triangle', icon: IoTriangleOutline, name: 'Triangle', shortcut: 'T' },
  { id: 'diamond', icon: BsDiamond, name: 'Diamond', shortcut: 'D' },
];

export const TEXT_TOOLS = [
  { id: 'text', icon: FaFont, name: 'Text', shortcut: 'X' },
  { id: 'codeBlock', icon: FaCode, name: 'Code Block', shortcut: 'C' },
  { id: 'stickyNote', icon: FaStickyNote, name: 'Sticky Note', shortcut: 'N' },
];

export const INTERVIEW_TOOLS = [
  { id: 'flowchart', icon: FaProjectDiagram, name: 'Flowchart', shortcut: 'F' },
  { id: 'table', icon: FaTable, name: 'Table', shortcut: 'B' },
  { id: 'checklist', icon: FaCheckSquare, name: 'Checklist', shortcut: 'K' },
  { id: 'numberedList', icon: FaListOl, name: 'List', shortcut: 'I' },
];

export const ALL_TOOLS = [
  ...DRAWING_TOOLS,
  ...SHAPE_TOOLS,
  ...TEXT_TOOLS,
  ...INTERVIEW_TOOLS,
];

export const SHAPE_TOOL_IDS = [
  'line',
  'arrow',
  'rectangle',
  'circle',
  'triangle',
  'diamond',
  'flowchart',
];

export const FREEHAND_TOOL_IDS = ['pen', 'highlighter', 'eraser'];
