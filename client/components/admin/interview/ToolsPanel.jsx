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
        })}import React, { useState } from 'react';
import { FaTimes, FaCode, FaChalkboard, FaQuestionCircle, FaComments, FaExpand } from 'react-icons/fa';
import QuestionViewer from '../../../pages/admin/Interview/QuestionViewer';
import CodeEditorPanel from '../../../pages/admin/Interview/CodeEditorPanel';
import WhiteboardPanel from '../../../pages/admin/Interview/WhiteboardPanel';

const ToolsPanel = ({ meeting, visible, onClose, selectedTool, onToolChange, user, socket, meetingId }) => {
  const [isWhiteboardFullscreen, setIsWhiteboardFullscreen] = useState(false);

  if (!visible) return null;

  const tools = [
    {
      id: 'questions',
      name: 'Questions',
      icon: FaQuestionCircle,
      enabled: meeting?.assignedQuestions?.length > 0,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 'code',
      name: 'Code Editor',
      icon: FaCode,
      enabled: meeting?.enabledTools?.codeEditor?.enabled,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
    },
    {
      id: 'whiteboard',
      name: 'Whiteboard',
      icon: FaChalkboard,
      enabled: meeting?.enabledTools?.whiteboard?.enabled,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: FaComments,
      enabled: meeting?.enabledTools?.chat?.enabled,
      color: 'cyan',
      gradient: 'from-cyan-500 to-cyan-600',
    },
  ];

  const enabledTools = tools.filter(tool => tool.enabled);

  // Handle fullscreen whiteboard
  if (isWhiteboardFullscreen && selectedTool === 'whiteboard') {
    return (
      <WhiteboardPanel
        onClose={() => setIsWhiteboardFullscreen(false)}
        meetingId={meetingId}
        socket={socket}
        isFullscreen={true}
        onToggleFullscreen={() => setIsWhiteboardFullscreen(false)}
      />
    );
  }

  return (
    <div className="absolute right-0 top-0 h-full w-[420px] bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-700 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">🛠️</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Interview Tools</h2>
            <p className="text-gray-400 text-xs">{enabledTools.length} tools available</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white transition-all p-2.5 hover:bg-gray-700 rounded-xl hover:rotate-90 duration-300"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Tool Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-700 overflow-x-auto bg-gray-800/30">
        {enabledTools.map(tool => {
          const Icon = tool.icon;
          const isActive = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? `bg-gradient-to-r ${tool.gradient} text-white shadow-lg scale-105`
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              <Icon className={isActive ? 'animate-pulse' : ''} />
              {tool.name}
            </button>
          );
        })}
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-hidden relative">
        {selectedTool === 'questions' && (
          <div className="h-full overflow-auto custom-scrollbar">
            <QuestionViewer questions={meeting?.assignedQuestions || []} />
          </div>
        )}

        {selectedTool === 'code' && (
          <div className="h-full">
            <CodeEditorPanel 
              languages={meeting?.enabledTools?.codeEditor?.languages || ['javascript']}
              questions={meeting?.assignedQuestions || []}
            />
          </div>
        )}

        {selectedTool === 'whiteboard' && (
          <div className="h-full">
            <WhiteboardPanel
              onClose={() => onToolChange(null)}
              meetingId={meetingId}
              socket={socket}
              isFullscreen={false}
              onToggleFullscreen={() => setIsWhiteboardFullscreen(true)}
            />
          </div>
        )}

        {selectedTool === 'chat' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <FaComments className="text-3xl text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Chat Feature</h3>
            <p className="text-gray-400 text-sm">Coming soon... Stay tuned!</p>
            <div className="mt-6 flex gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {!selectedTool && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <span className="text-5xl">👆</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Select a Tool</h3>
            <p className="text-gray-400 text-sm max-w-[200px]">
              Choose from the tools above to get started
            </p>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-xs">Tools Active</span>
        </div>
        <span className="text-gray-500 text-xs">v1.0</span>
      </div>
    </div>
  );
};

export default ToolsPanel;
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