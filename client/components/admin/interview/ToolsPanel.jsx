import React from 'react';
import { FaTimes, FaCode, FaChalkboard, FaQuestionCircle, FaComments } from 'react-icons/fa';
import QuestionViewer from '../../../pages/admin/Interview/QuestionViewer';
import CodeEditorPanel from '../../../pages/admin/Interview/CodeEditorPanel';
import WhiteboardPanel from '../../../pages/admin/Interview/WhiteboardPanel';

const ToolsPanel = ({ meeting, visible, onClose, selectedTool, onToolChange, user }) => {
  if (!visible) return null;

  const tools = [
    {
      id: 'questions',
      name: 'Questions',
      icon: FaQuestionCircle,
      enabled: meeting?.assignedQuestions?.length > 0,
      color: 'blue',
    },
    {
      id: 'code',
      name: 'Code Editor',
      icon: FaCode,
      enabled: meeting?.enabledTools?.codeEditor?.enabled,
      color: 'green',
    },
    {
      id: 'whiteboard',
      name: 'Whiteboard',
      icon: FaChalkboard,
      enabled: meeting?.enabledTools?.whiteboard?.enabled,
      color: 'purple',
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: FaComments,
      enabled: meeting?.enabledTools?.chat?.enabled,
      color: 'cyan',
    },
  ];

  const enabledTools = tools.filter(tool => tool.enabled);

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">Interview Tools</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Tool Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto">
        {enabledTools.map(tool => {
          const Icon = tool.icon;
          const isActive = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? `bg-${tool.color}-600 text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon />
              {tool.name}
            </button>
          );
        })}
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-auto">
        {selectedTool === 'questions' && (
          <QuestionViewer questions={meeting?.assignedQuestions || []} />
        )}
        {selectedTool === 'code' && (
          <CodeEditorPanel 
            languages={meeting?.enabledTools?.codeEditor?.languages || ['javascript']}
            questions={meeting?.assignedQuestions || []}
          />
        )}
        {selectedTool === 'whiteboard' && (
          <WhiteboardPanel />
        )}
        {selectedTool === 'chat' && (
          <div className="p-4 text-white">
            <p className="text-gray-400">Chat feature coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPanel;