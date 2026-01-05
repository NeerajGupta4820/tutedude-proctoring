import React from 'react';
import {
  FaTerminal,
  FaChevronDown,
  FaChevronUp,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';
import TestResultsView from './TestResultsView.jsx';

const OutputConsole = ({
  t,
  showOutput,
  setShowOutput,
  output,
  testResults,
  isLoading,
  outputTab,
  setOutputTab,
  outputHeight,
  isOutputExpanded,
  toggleOutputExpand,
  handleOutputResizeStart,
  minOutputHeight,
}) => {
  // Collapsed state with content indicator
  if (!showOutput && !isLoading) {
    if (output || testResults) {
      return <CollapsedConsole t={t} onClick={() => setShowOutput(true)} />;
    }
    return null;
  }

  return (
    <div
      className={`border-t ${t.border} ${t.outputBg} shrink-0 flex flex-col`}
      style={{ height: showOutput ? outputHeight : 'auto' }}
    >
      {/* Resize Handle */}
      {showOutput && (
        <ResizeHandle t={t} onMouseDown={handleOutputResizeStart} />
      )}

      {/* Console Header */}
      <ConsoleHeader
        t={t}
        outputTab={outputTab}
        setOutputTab={setOutputTab}
        isOutputExpanded={isOutputExpanded}
        toggleOutputExpand={toggleOutputExpand}
        setShowOutput={setShowOutput}
      />

      {/* Console Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ minHeight: minOutputHeight - 50 }}
      >
        {outputTab === 'testcases' && testResults ? (
          <TestResultsView testResults={testResults} t={t} />
        ) : (
          <div className="px-4 py-3">
            <pre
              className={`text-sm ${t.outputText} font-mono whitespace-pre-wrap leading-relaxed`}
            >
              {output || 'Run your code to see output here...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Collapsed Console Bar
const CollapsedConsole = ({ t, onClick }) => (
  <div
    className={`border-t ${t.border} ${t.outputBg} shrink-0 cursor-pointer hover:bg-opacity-80 transition-colors`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <FaTerminal size={12} className={t.textSecondary} />
        <span className={`text-sm ${t.textSecondary}`}>
          Console (Click to expand)
        </span>
      </div>
      <FaChevronUp size={12} className={t.textSecondary} />
    </div>
  </div>
);

// Resize Handle
const ResizeHandle = ({ t, onMouseDown }) => (
  <div
    className={`h-1.5 ${t.bgTertiary} hover:bg-blue-500 cursor-row-resize transition-colors flex items-center justify-center group`}
    onMouseDown={onMouseDown}
  >
    <div className="w-8 h-0.5 bg-gray-400 group-hover:bg-white rounded-full transition-colors" />
  </div>
);

// Console Header
const ConsoleHeader = ({
  t,
  outputTab,
  setOutputTab,
  isOutputExpanded,
  toggleOutputExpand,
  setShowOutput,
}) => (
  <div
    className={`flex items-center justify-between px-4 py-2.5 border-b ${t.outputBorder}`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center gap-2 ${t.outputText} text-sm font-medium`}
      >
        <FaTerminal size={12} />
        <span>Console</span>
      </div>

      {/* Output Tabs */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOutputTab('testcases')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            outputTab === 'testcases'
              ? `${t.accentBg} ${t.accentText}`
              : `${t.outputText} opacity-60 hover:opacity-100`
          }`}
        >
          Test Cases
        </button>
        <button
          onClick={() => setOutputTab('output')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            outputTab === 'output'
              ? `${t.accentBg} ${t.accentText}`
              : `${t.outputText} opacity-60 hover:opacity-100`
          }`}
        >
          Raw Output
        </button>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={toggleOutputExpand}
        className={`p-1.5 ${t.buttonBg} ${t.buttonHover} rounded transition-colors`}
        title={isOutputExpanded ? 'Collapse' : 'Expand'}
      >
        {isOutputExpanded ? (
          <FaCompress size={10} className={t.textSecondary} />
        ) : (
          <FaExpand size={10} className={t.textSecondary} />
        )}
      </button>

      <button
        onClick={() => setShowOutput(false)}
        className={`p-1.5 ${t.buttonBg} ${t.buttonHover} rounded transition-colors`}
      >
        <FaChevronDown size={12} className={t.textSecondary} />
      </button>
    </div>
  </div>
);

export default OutputConsole;
