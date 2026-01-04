// components/tools/QuestionPanel.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExpand,
  FaCompress,
  FaEye,
  FaEyeSlash,
  FaPlay,
  FaCheck,
  FaLock,
  FaCode,
  FaLightbulb,
  FaChevronDown,
  FaChevronUp,
  FaTerminal,
} from 'react-icons/fa';
import { Editor } from '@monaco-editor/react';

const QuestionPanel = ({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  onClose,
  isInterviewer = false,
  isFullscreen = false,
  onFullscreenChange,
  isVisibleToCandidate = false,
  onVisibilityChange,
  socket,
  meetingId,
}) => {
  const question = questions?.[currentQuestionIndex];

  // Code Editor States
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Panel resize state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  // Language options
  const languages = [
    { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { value: 'python', label: 'Python', monaco: 'python' },
    { value: 'java', label: 'Java', monaco: 'java' },
    { value: 'cpp', label: 'C++', monaco: 'cpp' },
  ];

  // Set initial code based on language and question
  useEffect(() => {
    if (question?.starterCode?.[language]?.code) {
      setCode(question.starterCode[language].code);
    } else {
      const defaults = {
        javascript: `function solution() {\n    // Write your code here\n    \n}`,
        python: `def solution():\n    # Write your code here\n    pass`,
        java: `class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}`,
        cpp: `class Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};`,
      };
      setCode(defaults[language] || '// Write your code here');
    }
  }, [language, question]);

  // Copy Protection for candidates
  useEffect(() => {
    if (isInterviewer) return;

    const handleCopy = (e) => e.preventDefault();
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'a', 'x'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };
    const handleSelectStart = (e) => e.preventDefault();

    const questionPanel = document.getElementById('question-content');
    if (questionPanel) {
      questionPanel.addEventListener('copy', handleCopy);
      questionPanel.addEventListener('contextmenu', handleContextMenu);
      questionPanel.addEventListener('selectstart', handleSelectStart);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (questionPanel) {
        questionPanel.removeEventListener('copy', handleCopy);
        questionPanel.removeEventListener('contextmenu', handleContextMenu);
        questionPanel.removeEventListener('selectstart', handleSelectStart);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInterviewer]);

  // Panel Resize Handlers
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 25 && newWidth <= 75) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Socket Emitters
  const emitFullscreenChange = useCallback(
    (newFullscreen) => {
      if (socket && meetingId && isInterviewer) {
        socket.emit('question-fullscreen', {
          meetingId,
          isFullscreen: newFullscreen,
        });
      }
    },
    [socket, meetingId, isInterviewer]
  );

  const emitVisibilityChange = useCallback(
    (newVisibility) => {
      if (socket && meetingId && isInterviewer) {
        socket.emit('question-visibility', {
          meetingId,
          isVisible: newVisibility,
        });
      }
    },
    [socket, meetingId, isInterviewer]
  );

  const emitQuestionChange = useCallback(
    (newIndex) => {
      if (socket && meetingId && isInterviewer) {
        socket.emit('question-change', { meetingId, questionIndex: newIndex });
      }
    },
    [socket, meetingId, isInterviewer]
  );

  // Handlers
  const toggleFullscreen = useCallback(() => {
    if (!isInterviewer) return;
    const newFullscreen = !isFullscreen;
    onFullscreenChange?.(newFullscreen);
    emitFullscreenChange(newFullscreen);
  }, [isInterviewer, isFullscreen, onFullscreenChange, emitFullscreenChange]);

  const toggleVisibility = useCallback(() => {
    if (!isInterviewer) return;
    const newVisibility = !isVisibleToCandidate;
    onVisibilityChange?.(newVisibility);
    emitVisibilityChange(newVisibility);
  }, [
    isInterviewer,
    isVisibleToCandidate,
    onVisibilityChange,
    emitVisibilityChange,
  ]);

  const handlePrevQuestion = () => {
    const newIndex = Math.max(0, currentQuestionIndex - 1);
    setCurrentQuestionIndex(newIndex);
    if (isInterviewer) emitQuestionChange(newIndex);
  };

  const handleNextQuestion = () => {
    const newIndex = Math.min(questions.length - 1, currentQuestionIndex + 1);
    setCurrentQuestionIndex(newIndex);
    if (isInterviewer) emitQuestionChange(newIndex);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput('Running...\n');
    setTimeout(() => {
      setOutput(
        `✓ Test Case 1 Passed\n✓ Test Case 2 Passed\n\nAll test cases passed!`
      );
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput('Submitting...\n');
    setTimeout(() => {
      setOutput(`🎉 Accepted!\n\n✓ All test cases passed`);
      setIsRunning(false);
    }, 2000);
  };

  const copyProtectionStyles = !isInterviewer
    ? {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }
    : {};

  // Empty State
  if (!questions || questions.length === 0 || !question) {
    return (
      <div
        className={`${isFullscreen ? 'fixed inset-0 z-[9999]' : 'w-full h-full'} bg-white flex flex-col`}
      >
        <Header
          isInterviewer={isInterviewer}
          isFullscreen={isFullscreen}
          isVisibleToCandidate={isVisibleToCandidate}
          toggleVisibility={toggleVisibility}
          toggleFullscreen={toggleFullscreen}
          onClose={onClose}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions?.length || 0}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaLock className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {isInterviewer
                ? 'No questions assigned'
                : 'Waiting for interviewer...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-[9999]' : 'w-full h-full'} bg-white flex flex-col`}
    >
      {/* Header */}
      <Header
        isInterviewer={isInterviewer}
        isFullscreen={isFullscreen}
        isVisibleToCandidate={isVisibleToCandidate}
        toggleVisibility={toggleVisibility}
        toggleFullscreen={toggleFullscreen}
        onClose={onClose}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        handlePrevQuestion={handlePrevQuestion}
        handleNextQuestion={handleNextQuestion}
        question={question}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question */}
        <div
          className="bg-white flex flex-col overflow-hidden border-r border-gray-200"
          style={{ width: isFullscreen ? `${leftPanelWidth}%` : '100%' }}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'description'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'hints'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Hints
            </button>
          </div>

          {/* Content */}
          <div
            id="question-content"
            className="flex-1 overflow-y-auto p-6"
            style={copyProtectionStyles}
          >
            {activeTab === 'description' && (
              <QuestionDescription question={question} />
            )}
            {activeTab === 'hints' && <HintsTab hints={question.hints} />}
          </div>
        </div>

        {/* Resizer */}
        {isFullscreen && (
          <div
            className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize"
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Right Panel - Code Editor */}
        {isFullscreen && (
          <div
            className="bg-white flex flex-col overflow-hidden"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaPlay size={10} />
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  <FaCheck size={10} />
                  Submit
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={
                  languages.find((l) => l.value === language)?.monaco ||
                  'javascript'
                }
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-light"
                options={{
                  fontSize: 14,
                  fontFamily: "'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  padding: { top: 16 },
                  lineHeight: 22,
                }}
              />
            </div>

            {/* Output Console */}
            {showOutput && (
              <div className="border-t border-gray-200 bg-gray-900">
                <div
                  className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  onClick={() => setShowOutput(!showOutput)}
                >
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <FaTerminal size={12} />
                    <span>Console</span>
                  </div>
                  <FaChevronDown size={10} className="text-gray-400" />
                </div>
                <div className="px-4 pb-3 max-h-32 overflow-y-auto">
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar for Candidates */}
      {!isInterviewer && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
          <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <FaLock size={10} />
            Content protected
          </span>
        </div>
      )}
    </div>
  );
};

// Header Component
const Header = ({
  isInterviewer,
  isFullscreen,
  isVisibleToCandidate,
  toggleVisibility,
  toggleFullscreen,
  onClose,
  currentQuestionIndex,
  totalQuestions,
  handlePrevQuestion,
  handleNextQuestion,
  question,
}) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
    {/* Left */}
    <div className="flex items-center gap-4">
      {totalQuestions > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0 || !isInterviewer}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            <FaChevronLeft size={12} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 px-2">
            {currentQuestionIndex + 1}/{totalQuestions}
          </span>
          <button
            onClick={handleNextQuestion}
            disabled={
              currentQuestionIndex === totalQuestions - 1 || !isInterviewer
            }
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            <FaChevronRight size={12} className="text-gray-600" />
          </button>
        </div>
      )}

      {question && (
        <div className="flex items-center gap-3">
          <h1 className="text-gray-900 font-semibold">
            {question.questionNumber}. {question.title}
          </h1>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              question.difficulty === 'easy'
                ? 'text-green-600 bg-green-50'
                : question.difficulty === 'medium'
                  ? 'text-yellow-600 bg-yellow-50'
                  : 'text-red-600 bg-red-50'
            }`}
          >
            {question.difficulty}
          </span>
        </div>
      )}
    </div>

    {/* Right */}
    <div className="flex items-center gap-1">
      {isInterviewer && (
        <>
          <button
            onClick={toggleVisibility}
            className={`p-2 rounded ${
              isVisibleToCandidate
                ? 'text-green-600 bg-green-50'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title={
              isVisibleToCandidate
                ? 'Visible to Candidate'
                : 'Hidden from Candidate'
            }
          >
            {isVisibleToCandidate ? (
              <FaEye size={16} />
            ) : (
              <FaEyeSlash size={16} />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded ${
              isFullscreen
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
          </button>
        </>
      )}
      <button
        onClick={onClose}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded hover:text-red-500"
      >
        <FaTimes size={16} />
      </button>
    </div>
  </div>
);

// Question Description Component
const QuestionDescription = ({ question }) => (
  <div className="space-y-6 text-gray-700">
    {/* Description */}
    {question.description && (
      <p className="leading-relaxed">{question.description}</p>
    )}

    {/* Problem Statement */}
    {question.problemStatement && (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="whitespace-pre-wrap">{question.problemStatement}</p>
      </div>
    )}

    {/* Input/Output Format */}
    {(question.inputFormat || question.outputFormat) && (
      <div className="space-y-3">
        {question.inputFormat && (
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Input Format:</h3>
            <pre className="bg-gray-50 p-3 rounded text-sm font-mono">
              {question.inputFormat}
            </pre>
          </div>
        )}
        {question.outputFormat && (
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Output Format:</h3>
            <pre className="bg-gray-50 p-3 rounded text-sm font-mono">
              {question.outputFormat}
            </pre>
          </div>
        )}
      </div>
    )}

    {/* Examples */}
    {question.examples?.length > 0 && (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Examples:</h3>
        {question.examples.map((example, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-100 text-sm font-medium text-gray-600">
              Example {idx + 1}
            </div>
            <div className="p-4 space-y-2">
              <div>
                <span className="text-gray-500 text-sm">Input: </span>
                <code className="text-sm bg-white px-2 py-0.5 rounded">
                  {example.input}
                </code>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Output: </span>
                <code className="text-sm bg-white px-2 py-0.5 rounded">
                  {example.output}
                </code>
              </div>
              {example.explanation && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-500 text-sm">Explanation: </span>
                  <span className="text-sm">{example.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Constraints */}
    {question.constraints?.length > 0 && (
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Constraints:</h3>
        <ul className="space-y-1">
          {question.constraints.map((c, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-gray-400">•</span>
              <code className="text-sm bg-gray-50 px-2 py-0.5 rounded">
                {c}
              </code>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Category & Tags */}
    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
      {question.category && (
        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
          {question.category}
        </span>
      )}
      {question.tags?.map((tag, idx) => (
        <span
          key={idx}
          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

// Hints Tab Component
const HintsTab = ({ hints }) => {
  const [openHint, setOpenHint] = useState(null);

  if (!hints?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="text-center">
          <FaLightbulb className="text-3xl mx-auto mb-2 opacity-50" />
          <p>No hints available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hints.map((hint, idx) => (
        <div
          key={idx}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenHint(openHint === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <FaLightbulb className="text-yellow-500" />
              <span className="font-medium text-gray-700">
                Hint {hint.level || idx + 1}
              </span>
            </div>
            {openHint === idx ? (
              <FaChevronUp className="text-gray-400" size={12} />
            ) : (
              <FaChevronDown className="text-gray-400" size={12} />
            )}
          </button>
          {openHint === idx && (
            <div className="px-4 pb-4 text-gray-600 border-t border-gray-100 pt-3">
              {hint.text || hint.content || hint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionPanel;
