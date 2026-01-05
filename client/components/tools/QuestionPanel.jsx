// components/tools/QuestionPanel/QuestionPanel.jsx
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  FaLock,
  FaCode,
  FaLightbulb,
  FaHistory,
  FaPlay,
  FaCheck,
  FaRedo,
  FaSpinner,
  FaUsers,
  FaBroadcastTower,
} from 'react-icons/fa';
import { Editor } from '@monaco-editor/react';
import { toast } from 'sonner';

// Hooks
import { useCodeExecution } from '../../hooks/useCodeExecution';
import { useCodeSync } from '../../hooks/useCodeSync';

// Components
import Header from './questionpannel/Header';
import OutputConsole from './questionpannel/OutputConsole';
import QuestionDescription from './questionpannel/QuestionDescription';
import HintsTab from './questionpannel/HintsTab';
import SubmissionsTab from './questionpannel/SubmissionsTab';

// Constants & Utils
import { themes } from '../../constants/questionpannel/themes';
import { languages } from '../../constants/questionpannel/languages';
import {
  getStarterCode,
  getDifficultyStyles,
  getCopyProtectionStyles,
} from '../../utlis/questionpannel/starterCode';

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
  candidateId,
  user,
}) => {
  const question = questions?.[currentQuestionIndex];

  // Theme State
  const [theme, setTheme] = useState('light');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const t = themes[theme];

  // Code Editor States
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showOutput, setShowOutput] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [outputTab, setOutputTab] = useState('testcases');

  // Output Panel Resize State
  const [outputHeight, setOutputHeight] = useState(200);
  const [isResizingOutput, setIsResizingOutput] = useState(false);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const minOutputHeight = 100;
  const maxOutputHeight = 500;

  // Admin Controls State
  const [shareOutputWithCandidate, setShareOutputWithCandidate] =
    useState(false);

  // Panel resize state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // Code Execution Hook
  const {
    isRunning,
    isSubmitting,
    isLoading,
    output,
    testResults,
    lastSubmission,
    runCode: executeRunCode,
    submitCode: executeSubmitCode,
    clearOutput,
    setTestResults,
  } = useCodeExecution({
    questionId: question?._id,
    meetingId,
    candidateId,
    onRunComplete: (data) => {
      setShowOutput(true);
      setOutputTab('testcases');
      broadcastOutput(data, 'run');
    },
    onSubmitComplete: (data) => {
      setShowOutput(true);
      setOutputTab('testcases');
      broadcastOutput(data, 'submit');
    },
  });

  // Code Sync Hook
  const {
    isRemoteUpdate,
    lastSyncedBy,
    handleCodeChange,
    handleLanguageChange,
    handleResetCode,
  } = useCodeSync({
    socket,
    meetingId,
    user,
    question,
    language,
    setLanguage,
    code,
    setCode,
    isInterviewer,
    currentQuestionIndex,
    setTestResults,
  });

  // Broadcast output to others
  const broadcastOutput = useCallback(
    (data, type) => {
      if (socket && meetingId) {
        const shouldBroadcast = !isInterviewer || shareOutputWithCandidate;
        if (shouldBroadcast || !isInterviewer) {
          socket.emit('code-output-sync', {
            meetingId,
            output: data,
            type,
            fromUserId: user?.id,
            fromUserName: user?.name,
            fromUserRole: user?.role,
            shareWithCandidate: !isInterviewer
              ? true
              : shareOutputWithCandidate,
          });
        }
      }
    },
    [socket, meetingId, isInterviewer, shareOutputWithCandidate, user]
  );

  // Set initial code
  useEffect(() => {
    if (!isRemoteUpdate) {
      const starterCode = getStarterCode(question, language);
      setCode(starterCode);
    }
  }, [language, question, isRemoteUpdate]);

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
        if (e.target.closest('.monaco-editor')) return;
        e.preventDefault();
      }
    };

    const questionPanel = document.getElementById('question-content');
    if (questionPanel) {
      questionPanel.addEventListener('copy', handleCopy);
      questionPanel.addEventListener('contextmenu', handleContextMenu);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (questionPanel) {
        questionPanel.removeEventListener('copy', handleCopy);
        questionPanel.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInterviewer]);

  // Panel Resize Handlers
  useResizePanel({
    isResizing,
    setIsResizing,
    setLeftPanelWidth,
    containerRef,
  });

  // Output Panel Resize Handlers
  useOutputResize({
    isResizingOutput,
    setIsResizingOutput,
    setOutputHeight,
    containerRef,
    minOutputHeight,
    maxOutputHeight,
  });

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

  // Toggle handlers
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

  // Navigation handlers
  const handlePrevQuestion = () => {
    const newIndex = Math.max(0, currentQuestionIndex - 1);
    setCurrentQuestionIndex(newIndex);
    if (isInterviewer) emitQuestionChange(newIndex);
    clearOutput();
  };

  const handleNextQuestion = () => {
    const newIndex = Math.min(questions.length - 1, currentQuestionIndex + 1);
    setCurrentQuestionIndex(newIndex);
    if (isInterviewer) emitQuestionChange(newIndex);
    clearOutput();
  };

  // Code execution handlers
  const handleRunCode = async () => {
    if (!question?._id) {
      toast.error('Question not loaded');
      return;
    }
    await executeRunCode(code, language);
  };

  const handleSubmitCode = async () => {
    if (!question?._id) {
      toast.error('Question not loaded');
      return;
    }
    if (!meetingId || !candidateId) {
      toast.error('Meeting or candidate information missing');
      return;
    }
    await executeSubmitCode(code, language);
  };

  // Reset with broadcast
  const handleReset = () => {
    handleResetCode();
    clearOutput();
  };

  // Toggle output expand
  const toggleOutputExpand = () => {
    if (isOutputExpanded) {
      setOutputHeight(200);
    } else {
      setOutputHeight(maxOutputHeight);
    }
    setIsOutputExpanded(!isOutputExpanded);
  };

  // Editor mount handler
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        handleSubmitCode();
      }
    );
  };

  // Difficulty styles getter
  const getDifficultyStylesForQuestion = (difficulty) => {
    return getDifficultyStyles(difficulty, t);
  };

  const copyProtectionStyles = getCopyProtectionStyles(isInterviewer);

  // Empty State
  if (!questions || questions.length === 0 || !question) {
    return (
      <EmptyState
        t={t}
        themes={themes}
        theme={theme}
        setTheme={setTheme}
        showThemeMenu={showThemeMenu}
        setShowThemeMenu={setShowThemeMenu}
        isInterviewer={isInterviewer}
        isFullscreen={isFullscreen}
        isVisibleToCandidate={isVisibleToCandidate}
        toggleVisibility={toggleVisibility}
        toggleFullscreen={toggleFullscreen}
        onClose={onClose}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions?.length || 0}
      />
    );
  }

  // Main Render
  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-[9999]' : 'w-full h-full'} ${t.bg} flex flex-col transition-colors duration-200`}
    >
      {/* Header */}
      <Header
        t={t}
        themes={themes}
        theme={theme}
        setTheme={setTheme}
        showThemeMenu={showThemeMenu}
        setShowThemeMenu={setShowThemeMenu}
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
        getDifficultyStyles={getDifficultyStylesForQuestion}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Question Description */}
        <LeftPanel
          t={t}
          leftPanelWidth={leftPanelWidth}
          isFullscreen={isFullscreen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lastSubmission={lastSubmission}
          question={question}
          copyProtectionStyles={copyProtectionStyles}
        />

        {/* Resizer */}
        {isFullscreen && (
          <PanelResizer
            t={t}
            onMouseDown={(e) => {
              setIsResizing(true);
              e.preventDefault();
            }}
          />
        )}

        {/* Right Panel - Code Editor */}
        {isFullscreen && (
          <RightPanel
            t={t}
            leftPanelWidth={leftPanelWidth}
            language={language}
            languages={languages}
            handleLanguageChange={handleLanguageChange}
            handleReset={handleReset}
            lastSyncedBy={lastSyncedBy}
            isInterviewer={isInterviewer}
            shareOutputWithCandidate={shareOutputWithCandidate}
            setShareOutputWithCandidate={setShareOutputWithCandidate}
            isLoading={isLoading}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            handleRunCode={handleRunCode}
            handleSubmitCode={handleSubmitCode}
            code={code}
            handleCodeChange={handleCodeChange}
            handleEditorMount={handleEditorMount}
            showOutput={showOutput}
            setShowOutput={setShowOutput}
            output={output}
            testResults={testResults}
            outputTab={outputTab}
            setOutputTab={setOutputTab}
            outputHeight={outputHeight}
            isOutputExpanded={isOutputExpanded}
            toggleOutputExpand={toggleOutputExpand}
            handleOutputResizeStart={(e) => {
              setIsResizingOutput(true);
              e.preventDefault();
            }}
            minOutputHeight={minOutputHeight}
          />
        )}
      </div>

      {/* Bottom Bar for Candidates */}
      {!isInterviewer && (
        <div
          className={`px-4 py-2.5 ${t.bgSecondary} border-t ${t.border} text-center shrink-0`}
        >
          <span
            className={`text-xs ${t.textMuted} flex items-center justify-center gap-1.5`}
          >
            <FaLock size={10} />
            Content protected - Copy disabled
          </span>
        </div>
      )}
    </div>
  );
};

// ============ Sub-components ============

// Empty State Component
const EmptyState = ({
  t,
  isInterviewer,
  isFullscreen,
  onClose,
  ...headerProps
}) => (
  <div
    className={`${isFullscreen ? 'fixed inset-0 z-[9999]' : 'w-full h-full'} ${t.bg} flex flex-col transition-colors duration-200`}
  >
    <Header
      t={t}
      isInterviewer={isInterviewer}
      isFullscreen={isFullscreen}
      onClose={onClose}
      {...headerProps}
    />
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <FaLock className={`text-5xl ${t.textMuted} mx-auto mb-4`} />
        <p className={`${t.textSecondary} text-lg`}>
          {isInterviewer
            ? 'No questions assigned to this interview'
            : 'Waiting for interviewer to share questions...'}
        </p>
      </div>
    </div>
  </div>
);

// Left Panel Component
const LeftPanel = ({
  t,
  leftPanelWidth,
  isFullscreen,
  activeTab,
  setActiveTab,
  lastSubmission,
  question,
  copyProtectionStyles,
}) => (
  <div
    className={`${t.bg} flex flex-col overflow-hidden border-r ${t.border}`}
    style={{ width: isFullscreen ? `${leftPanelWidth}%` : '100%' }}
  >
    {/* Tabs Header */}
    <div className={`flex ${t.border} border-b shrink-0`}>
      <TabButton
        active={activeTab === 'description'}
        onClick={() => setActiveTab('description')}
        icon={FaCode}
        label="Description"
        t={t}
      />
      <TabButton
        active={activeTab === 'hints'}
        onClick={() => setActiveTab('hints')}
        icon={FaLightbulb}
        label="Hints"
        t={t}
      />
      {lastSubmission && (
        <TabButton
          active={activeTab === 'submissions'}
          onClick={() => setActiveTab('submissions')}
          icon={FaHistory}
          label="Submissions"
          t={t}
        />
      )}
    </div>

    {/* Content */}
    <div
      id="question-content"
      className="flex-1 overflow-y-auto p-6"
      style={copyProtectionStyles}
    >
      {activeTab === 'description' && (
        <QuestionDescription question={question} t={t} />
      )}
      {activeTab === 'hints' && <HintsTab hints={question.hints} t={t} />}
      {activeTab === 'submissions' && lastSubmission && (
        <SubmissionsTab submission={lastSubmission} t={t} />
      )}
    </div>
  </div>
);

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label, t }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3.5 text-sm font-medium transition-colors ${
      active ? t.tabActive : t.tabInactive
    }`}
  >
    <span className="flex items-center gap-2">
      <Icon size={14} />
      {label}
    </span>
  </button>
);

// Panel Resizer Component
const PanelResizer = ({ t, onMouseDown }) => (
  <div
    className={`w-1.5 ${t.bgTertiary} hover:bg-blue-500 cursor-col-resize transition-colors flex items-center justify-center group`}
    onMouseDown={onMouseDown}
  >
    <div className="w-0.5 h-8 bg-gray-400 group-hover:bg-white rounded-full transition-colors" />
  </div>
);

// Right Panel Component
const RightPanel = ({
  t,
  leftPanelWidth,
  language,
  languages,
  handleLanguageChange,
  handleReset,
  lastSyncedBy,
  isInterviewer,
  shareOutputWithCandidate,
  setShareOutputWithCandidate,
  isLoading,
  isRunning,
  isSubmitting,
  handleRunCode,
  handleSubmitCode,
  code,
  handleCodeChange,
  handleEditorMount,
  showOutput,
  setShowOutput,
  output,
  testResults,
  outputTab,
  setOutputTab,
  outputHeight,
  isOutputExpanded,
  toggleOutputExpand,
  handleOutputResizeStart,
  minOutputHeight,
}) => (
  <div
    className={`${t.bg} flex flex-col overflow-hidden`}
    style={{ width: `${100 - leftPanelWidth}%` }}
  >
    {/* Editor Header */}
    <EditorHeader
      t={t}
      language={language}
      languages={languages}
      handleLanguageChange={handleLanguageChange}
      handleReset={handleReset}
      lastSyncedBy={lastSyncedBy}
      isInterviewer={isInterviewer}
      shareOutputWithCandidate={shareOutputWithCandidate}
      setShareOutputWithCandidate={setShareOutputWithCandidate}
      isLoading={isLoading}
      isRunning={isRunning}
      isSubmitting={isSubmitting}
      handleRunCode={handleRunCode}
      handleSubmitCode={handleSubmitCode}
    />

    {/* Monaco Editor */}
    <div
      className="flex-1 min-h-0"
      style={{
        height: showOutput ? `calc(100% - ${outputHeight}px - 45px)` : '100%',
      }}
    >
      <Editor
        height="100%"
        language={
          languages.find((l) => l.value === language)?.monaco || 'javascript'
        }
        value={code}
        onChange={handleCodeChange}
        theme={t.editorTheme}
        onMount={handleEditorMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          lineHeight: 24,
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          suggest: { showKeywords: true, showSnippets: true },
        }}
      />
    </div>

    {/* Output Console */}
    <OutputConsole
      t={t}
      showOutput={showOutput}
      setShowOutput={setShowOutput}
      output={output}
      testResults={testResults}
      isLoading={isLoading}
      outputTab={outputTab}
      setOutputTab={setOutputTab}
      outputHeight={outputHeight}
      isOutputExpanded={isOutputExpanded}
      toggleOutputExpand={toggleOutputExpand}
      handleOutputResizeStart={handleOutputResizeStart}
      minOutputHeight={minOutputHeight}
    />
  </div>
);

// Editor Header Component
const EditorHeader = ({
  t,
  language,
  languages,
  handleLanguageChange,
  handleReset,
  lastSyncedBy,
  isInterviewer,
  shareOutputWithCandidate,
  setShareOutputWithCandidate,
  isLoading,
  isRunning,
  isSubmitting,
  handleRunCode,
  handleSubmitCode,
}) => (
  <div
    className={`flex items-center justify-between px-4 py-2.5 border-b ${t.border} ${t.bgSecondary} shrink-0`}
  >
    <div className="flex items-center gap-3">
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className={`px-3 py-1.5 ${t.inputBg} border ${t.inputBorder} rounded-lg text-sm ${t.text} focus:outline-none focus:ring-2 ${t.inputFocus} transition-all cursor-pointer`}
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleReset}
        className={`p-2 ${t.buttonBg} ${t.buttonHover} rounded-lg ${t.textSecondary} transition-all border ${t.border}`}
        title="Reset Code"
      >
        <FaRedo size={12} />
      </button>

      {lastSyncedBy && (
        <div
          className={`flex items-center gap-1.5 px-2 py-1 ${t.accentBg} rounded-full`}
        >
          <FaUsers size={10} className={t.accentText} />
          <span className={`text-xs ${t.accentText}`}>
            {lastSyncedBy} typing...
          </span>
        </div>
      )}
    </div>

    <div className="flex items-center gap-2">
      {isInterviewer && (
        <button
          onClick={() => setShareOutputWithCandidate(!shareOutputWithCandidate)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            shareOutputWithCandidate
              ? `${t.successBg} ${t.successText} border-transparent`
              : `${t.buttonBg} ${t.textSecondary} ${t.buttonHover} ${t.border}`
          }`}
          title={shareOutputWithCandidate ? 'Output shared' : 'Output hidden'}
        >
          <FaBroadcastTower size={10} />
          {shareOutputWithCandidate ? 'Sharing' : 'Not Sharing'}
        </button>
      )}

      <span className={`text-xs ${t.textMuted} hidden md:block`}>
        Ctrl+Enter: Run | Ctrl+Shift+Enter: Submit
      </span>

      <button
        onClick={handleRunCode}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-1.5 ${t.buttonBg} border ${t.border} rounded-lg text-sm font-medium ${t.text} ${t.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
      >
        {isRunning ? (
          <FaSpinner size={12} className="animate-spin" />
        ) : (
          <FaPlay size={10} />
        )}
        {isRunning ? 'Running...' : 'Run'}
      </button>

      <button
        onClick={handleSubmitCode}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? (
          <FaSpinner size={12} className="animate-spin" />
        ) : (
          <FaCheck size={10} />
        )}
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  </div>
);

// Custom Hooks for Resize Logic
const useResizePanel = ({
  isResizing,
  setIsResizing,
  setLeftPanelWidth,
  containerRef,
}) => {
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
  }, [isResizing, setIsResizing, setLeftPanelWidth, containerRef]);
};

const useOutputResize = ({
  isResizingOutput,
  setIsResizingOutput,
  setOutputHeight,
  containerRef,
  minOutputHeight,
  maxOutputHeight,
}) => {
  useEffect(() => {
    const handleOutputResizeMove = (e) => {
      if (!isResizingOutput) return;
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const newHeight = containerRect.bottom - e.clientY;
      if (newHeight >= minOutputHeight && newHeight <= maxOutputHeight) {
        setOutputHeight(newHeight);
      }
    };

    const handleOutputResizeEnd = () => setIsResizingOutput(false);

    if (isResizingOutput) {
      document.addEventListener('mousemove', handleOutputResizeMove);
      document.addEventListener('mouseup', handleOutputResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleOutputResizeMove);
      document.removeEventListener('mouseup', handleOutputResizeEnd);
    };
  }, [
    isResizingOutput,
    setIsResizingOutput,
    setOutputHeight,
    containerRef,
    minOutputHeight,
    maxOutputHeight,
  ]);
};

export default QuestionPanel;
