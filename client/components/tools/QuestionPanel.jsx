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
  FaLightbulb,
  FaChevronDown,
  FaChevronUp,
  FaTerminal,
  FaSun,
  FaMoon,
  FaCode,
  FaPalette,
  FaRedo,
  FaHistory,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMemory,
} from 'react-icons/fa';
import { Editor } from '@monaco-editor/react';
import { toast } from 'sonner';
import { useCodeExecution } from '../../hooks/useCodeExecution';

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
}) => {
  const question = questions?.[currentQuestionIndex];

  // Theme State - Default Light
  const [theme, setTheme] = useState('light');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Code Editor States
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showOutput, setShowOutput] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [outputTab, setOutputTab] = useState('testcases'); // 'testcases' | 'output'

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
    error,
    runCode,
    submitCode,
    clearOutput,
  } = useCodeExecution({
    questionId: question?._id,
    meetingId,
    candidateId,
    onRunComplete: (data) => {
      setShowOutput(true);
      setOutputTab('testcases');
    },
    onSubmitComplete: (data) => {
      setShowOutput(true);
      setOutputTab('testcases');
    },
  });

  // Theme configurations
  const themes = {
    light: {
      name: 'Light',
      icon: FaSun,
      bg: 'bg-white',
      bgSecondary: 'bg-gray-50',
      bgTertiary: 'bg-gray-100',
      bgHeader: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-400',
      border: 'border-gray-200',
      borderHover: 'hover:border-gray-300',
      cardBg: 'bg-white',
      codeBg: 'bg-gray-50',
      consoleBg: 'bg-gray-900',
      consoleText: 'text-gray-100',
      buttonBg: 'bg-white',
      buttonHover: 'hover:bg-gray-50',
      buttonActiveBg: 'bg-gray-100',
      accentBg: 'bg-blue-50',
      accentText: 'text-blue-600',
      accentBorder: 'border-blue-500',
      successBg: 'bg-green-50',
      successText: 'text-green-600',
      warningBg: 'bg-yellow-50',
      warningText: 'text-yellow-600',
      dangerBg: 'bg-red-50',
      dangerText: 'text-red-600',
      editorTheme: 'vs-light',
      shadow: 'shadow-sm',
      tabActive: 'border-b-2 border-blue-500 text-blue-600',
      tabInactive: 'text-gray-500 hover:text-gray-700',
      inputBg: 'bg-white',
      inputBorder: 'border-gray-300',
      inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
    },
    dark: {
      name: 'Dark',
      icon: FaMoon,
      bg: 'bg-[#1e1e1e]',
      bgSecondary: 'bg-[#252526]',
      bgTertiary: 'bg-[#2d2d2d]',
      bgHeader: 'bg-[#252526]',
      text: 'text-gray-100',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-500',
      border: 'border-[#3e3e3e]',
      borderHover: 'hover:border-[#4e4e4e]',
      cardBg: 'bg-[#252526]',
      codeBg: 'bg-[#1e1e1e]',
      consoleBg: 'bg-[#1e1e1e]',
      consoleText: 'text-gray-100',
      buttonBg: 'bg-[#2d2d2d]',
      buttonHover: 'hover:bg-[#3e3e3e]',
      buttonActiveBg: 'bg-[#3e3e3e]',
      accentBg: 'bg-blue-900/30',
      accentText: 'text-blue-400',
      accentBorder: 'border-blue-400',
      successBg: 'bg-green-900/30',
      successText: 'text-green-400',
      warningBg: 'bg-yellow-900/30',
      warningText: 'text-yellow-400',
      dangerBg: 'bg-red-900/30',
      dangerText: 'text-red-400',
      editorTheme: 'vs-dark',
      shadow: 'shadow-lg shadow-black/20',
      tabActive: 'border-b-2 border-blue-400 text-blue-400',
      tabInactive: 'text-gray-400 hover:text-gray-200',
      inputBg: 'bg-[#3e3e3e]',
      inputBorder: 'border-[#4e4e4e]',
      inputFocus: 'focus:ring-blue-400 focus:border-blue-400',
    },
    github: {
      name: 'GitHub',
      icon: FaCode,
      bg: 'bg-[#0d1117]',
      bgSecondary: 'bg-[#161b22]',
      bgTertiary: 'bg-[#21262d]',
      bgHeader: 'bg-[#161b22]',
      text: 'text-[#c9d1d9]',
      textSecondary: 'text-[#8b949e]',
      textMuted: 'text-[#484f58]',
      border: 'border-[#30363d]',
      borderHover: 'hover:border-[#484f58]',
      cardBg: 'bg-[#161b22]',
      codeBg: 'bg-[#0d1117]',
      consoleBg: 'bg-[#0d1117]',
      consoleText: 'text-[#c9d1d9]',
      buttonBg: 'bg-[#21262d]',
      buttonHover: 'hover:bg-[#30363d]',
      buttonActiveBg: 'bg-[#30363d]',
      accentBg: 'bg-[#388bfd]/20',
      accentText: 'text-[#58a6ff]',
      accentBorder: 'border-[#58a6ff]',
      successBg: 'bg-[#238636]/20',
      successText: 'text-[#3fb950]',
      warningBg: 'bg-[#9e6a03]/20',
      warningText: 'text-[#d29922]',
      dangerBg: 'bg-[#da3633]/20',
      dangerText: 'text-[#f85149]',
      editorTheme: 'vs-dark',
      shadow: 'shadow-lg shadow-black/30',
      tabActive: 'border-b-2 border-[#58a6ff] text-[#58a6ff]',
      tabInactive: 'text-[#8b949e] hover:text-[#c9d1d9]',
      inputBg: 'bg-[#0d1117]',
      inputBorder: 'border-[#30363d]',
      inputFocus: 'focus:ring-[#58a6ff] focus:border-[#58a6ff]',
    },
  };

  const t = themes[theme];

  // Language options
  const languages = [
    { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { value: 'python', label: 'Python', monaco: 'python' },
    { value: 'java', label: 'Java', monaco: 'java' },
    { value: 'cpp', label: 'C++', monaco: 'cpp' },
    { value: 'c', label: 'C', monaco: 'c' },
    { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  ];

  // Set initial code based on language and question
  useEffect(() => {
    if (question?.starterCode?.[language]?.code) {
      setCode(question.starterCode[language].code);
    } else {
      const defaults = {
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
    // Write your code here
    
    return [];
}`,
        python: `class Solution:
    def solution(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        
        pass`,
        java: `class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your code here
        
        return new int[]{};
    }
}`,
        cpp: `class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Write your code here
        
        return {};
    }
};`,
        c: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* solution(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    
    return NULL;
}`,
        typescript: `function solution(nums: number[], target: number): number[] {
    // Write your code here
    
    return [];
}`,
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
        // Allow copy in code editor
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
    clearOutput();
  };

  const handleNextQuestion = () => {
    const newIndex = Math.min(questions.length - 1, currentQuestionIndex + 1);
    setCurrentQuestionIndex(newIndex);
    if (isInterviewer) emitQuestionChange(newIndex);
    clearOutput();
  };

  // Run Code Handler
  const handleRunCode = async () => {
    if (!question?._id) {
      toast.error('Question not loaded');
      return;
    }
    await runCode(code, language);
  };

  // Submit Code Handler
  const handleSubmitCode = async () => {
    if (!question?._id) {
      toast.error('Question not loaded');
      return;
    }
    if (!meetingId || !candidateId) {
      toast.error('Meeting or candidate information missing');
      return;
    }
    await submitCode(code, language);
  };

  // Reset Code Handler
  const handleResetCode = () => {
    if (question?.starterCode?.[language]?.code) {
      setCode(question.starterCode[language].code);
    } else {
      const defaults = {
        javascript: `function solution() {\n    // Write your code here\n}`,
        python: `def solution():\n    # Write your code here\n    pass`,
        java: `class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}`,
        cpp: `class Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};`,
        c: `int* solution() {\n    // Write your code here\n    return NULL;\n}`,
        typescript: `function solution(): void {\n    // Write your code here\n}`,
      };
      setCode(defaults[language] || '// Write your code here');
    }
    clearOutput();
    toast.success('Code reset to starter code');
  };

  // Editor mount handler
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcuts
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

  // Difficulty badge colors
  const getDifficultyStyles = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return `${t.successBg} ${t.successText}`;
      case 'medium':
        return `${t.warningBg} ${t.warningText}`;
      case 'hard':
        return `${t.dangerBg} ${t.dangerText}`;
      default:
        return `${t.bgTertiary} ${t.textSecondary}`;
    }
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
        className={`${isFullscreen ? 'fixed inset-0 z-[9999]' : 'w-full h-full'} ${t.bg} flex flex-col transition-colors duration-200`}
      >
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
          totalQuestions={questions?.length || 0}
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
        getDifficultyStyles={getDifficultyStyles}
      />

      {/* Main Content - Equal Height Panels */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Question Description */}
        <div
          className={`${t.bg} flex flex-col overflow-hidden border-r ${t.border}`}
          style={{ width: isFullscreen ? `${leftPanelWidth}%` : '100%' }}
        >
          {/* Tabs Header */}
          <div className={`flex ${t.border} border-b shrink-0`}>
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                activeTab === 'description' ? t.tabActive : t.tabInactive
              }`}
            >
              <span className="flex items-center gap-2">
                <FaCode size={14} />
                Description
              </span>
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                activeTab === 'hints' ? t.tabActive : t.tabInactive
              }`}
            >
              <span className="flex items-center gap-2">
                <FaLightbulb size={14} />
                Hints
              </span>
            </button>
            {lastSubmission && (
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === 'submissions' ? t.tabActive : t.tabInactive
                }`}
              >
                <span className="flex items-center gap-2">
                  <FaHistory size={14} />
                  Submissions
                </span>
              </button>
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

        {/* Resizer */}
        {isFullscreen && (
          <div
            className={`w-1.5 ${t.bgTertiary} hover:bg-blue-500 cursor-col-resize transition-colors flex items-center justify-center group`}
            onMouseDown={handleMouseDown}
          >
            <div className="w-0.5 h-8 bg-gray-400 group-hover:bg-white rounded-full transition-colors" />
          </div>
        )}

        {/* Right Panel - Code Editor */}
        {isFullscreen && (
          <div
            className={`${t.bg} flex flex-col overflow-hidden`}
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            {/* Editor Header */}
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b ${t.border} ${t.bgSecondary} shrink-0`}
            >
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`px-3 py-1.5 ${t.inputBg} border ${t.inputBorder} rounded-lg text-sm ${t.text} focus:outline-none focus:ring-2 ${t.inputFocus} transition-all cursor-pointer`}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                {/* Reset Button */}
                <button
                  onClick={handleResetCode}
                  className={`p-2 ${t.buttonBg} ${t.buttonHover} rounded-lg ${t.textSecondary} transition-all border ${t.border}`}
                  title="Reset Code (Ctrl+Shift+R)"
                >
                  <FaRedo size={12} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Keyboard Shortcuts Hint */}
                <span className={`text-xs ${t.textMuted} hidden md:block`}>
                  Ctrl+Enter: Run | Ctrl+Shift+Enter: Submit
                </span>

                {/* Run Button */}
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

                {/* Submit Button */}
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

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={
                  languages.find((l) => l.value === language)?.monaco ||
                  'javascript'
                }
                value={code}
                onChange={(value) => setCode(value || '')}
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
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                  },
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
            />
          </div>
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

// ============ Header Component ============
const Header = ({
  t,
  themes,
  theme,
  setTheme,
  showThemeMenu,
  setShowThemeMenu,
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
  getDifficultyStyles,
}) => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${t.bgHeader} border-b ${t.border} shrink-0`}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        {totalQuestions > 1 && (
          <div
            className={`flex items-center gap-1 ${t.bgSecondary} rounded-lg p-1`}
          >
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0 || !isInterviewer}
              className={`p-2 ${t.buttonHover} rounded-md disabled:opacity-30 transition-colors`}
            >
              <FaChevronLeft size={12} className={t.textSecondary} />
            </button>
            <span className={`text-sm ${t.textSecondary} px-3 font-medium`}>
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
            <button
              onClick={handleNextQuestion}
              disabled={
                currentQuestionIndex === totalQuestions - 1 || !isInterviewer
              }
              className={`p-2 ${t.buttonHover} rounded-md disabled:opacity-30 transition-colors`}
            >
              <FaChevronRight size={12} className={t.textSecondary} />
            </button>
          </div>
        )}

        {question && (
          <div className="flex items-center gap-3">
            <h1 className={`${t.text} font-semibold text-lg`}>
              {question.questionNumber}. {question.title}
            </h1>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getDifficultyStyles?.(question.difficulty) || ''}`}
            >
              {question.difficulty?.charAt(0).toUpperCase() +
                question.difficulty?.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`p-2.5 rounded-lg ${t.buttonBg} ${t.buttonHover} ${t.text} transition-all border ${t.border}`}
            title="Change Theme"
          >
            <FaPalette size={16} />
          </button>
          {showThemeMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowThemeMenu(false)}
              />
              <div
                className={`absolute right-0 top-full mt-2 ${t.cardBg} border ${t.border} rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]`}
              >
                {Object.entries(themes).map(([key, themeOption]) => {
                  const Icon = themeOption.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setTheme(key);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${t.text} ${t.buttonHover} transition-colors ${
                        theme === key ? t.accentBg : ''
                      }`}
                    >
                      <Icon
                        size={14}
                        className={
                          theme === key ? t.accentText : t.textSecondary
                        }
                      />
                      <span className={theme === key ? t.accentText : ''}>
                        {themeOption.name}
                      </span>
                      {theme === key && (
                        <FaCheck
                          size={10}
                          className={`ml-auto ${t.accentText}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {isInterviewer && (
          <>
            <button
              onClick={toggleVisibility}
              className={`p-2.5 rounded-lg transition-all border ${
                isVisibleToCandidate
                  ? `${t.successBg} ${t.successText} border-transparent`
                  : `${t.buttonBg} ${t.textSecondary} ${t.buttonHover} ${t.border}`
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
              className={`p-2.5 rounded-lg transition-all border ${
                isFullscreen
                  ? `${t.accentBg} ${t.accentText} border-transparent`
                  : `${t.buttonBg} ${t.textSecondary} ${t.buttonHover} ${t.border}`
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
            >
              {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className={`p-2.5 ${t.buttonBg} ${t.buttonHover} rounded-lg ${t.textSecondary} hover:text-red-500 transition-all border ${t.border}`}
          title="Close Panel"
        >
          <FaTimes size={16} />
        </button>
      </div>
    </div>
  );
};

// ============ Output Console Component ============
const OutputConsole = ({
  t,
  showOutput,
  setShowOutput,
  output,
  testResults,
  isLoading,
  outputTab,
  setOutputTab,
}) => {
  if (!showOutput && !isLoading) return null;

  return (
    <div className={`border-t ${t.border} ${t.consoleBg} shrink-0`}>
      {/* Console Header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${t.border}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${t.consoleText} text-sm font-medium`}
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
                  : `${t.consoleText} opacity-60 hover:opacity-100`
              }`}
            >
              Test Cases
            </button>
            <button
              onClick={() => setOutputTab('output')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                outputTab === 'output'
                  ? `${t.accentBg} ${t.accentText}`
                  : `${t.consoleText} opacity-60 hover:opacity-100`
              }`}
            >
              Raw Output
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowOutput(false)}
          className={`${t.textMuted} hover:${t.consoleText} transition-colors`}
        >
          <FaChevronDown size={12} />
        </button>
      </div>

      {/* Console Content */}
      <div className="max-h-48 overflow-y-auto">
        {outputTab === 'testcases' && testResults ? (
          <TestResultsView testResults={testResults} t={t} />
        ) : (
          <div className="px-4 py-3">
            <pre
              className={`text-sm ${t.consoleText} font-mono whitespace-pre-wrap leading-relaxed`}
            >
              {output || 'Run your code to see output here...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ Test Results View Component ============
const TestResultsView = ({ testResults, t }) => {
  if (!testResults) return null;

  const { testResults: results, summary } = testResults;

  return (
    <div className="p-4">
      {/* Summary */}
      <div className={`flex items-center gap-4 mb-4 pb-3 border-b ${t.border}`}>
        <div className="flex items-center gap-2">
          {summary?.passed === summary?.totalTests ? (
            <FaCheckCircle className="text-green-500" size={18} />
          ) : (
            <FaTimesCircle className="text-red-500" size={18} />
          )}
          <span className={`${t.consoleText} font-medium`}>
            {summary?.passed}/{summary?.totalTests} test cases passed
          </span>
        </div>

        {summary?.avgRuntime && (
          <div className={`flex items-center gap-1 ${t.textMuted} text-sm`}>
            <FaClock size={12} />
            <span>{summary.runtimeDisplay}</span>
          </div>
        )}

        {summary?.avgMemory && (
          <div className={`flex items-center gap-1 ${t.textMuted} text-sm`}>
            <FaMemory size={12} />
            <span>{summary.memoryDisplay}</span>
          </div>
        )}
      </div>

      {/* Individual Test Cases */}
      <div className="space-y-2">
        {results?.slice(0, 10).map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${result.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <FaCheckCircle className="text-green-500" size={14} />
                ) : (
                  <FaTimesCircle className="text-red-500" size={14} />
                )}
                <span className={`${t.consoleText} font-medium text-sm`}>
                  Test Case {result.testCaseIndex || index + 1}
                </span>
                {result.isHidden && (
                  <span
                    className={`text-xs ${t.textMuted} px-2 py-0.5 rounded bg-gray-700`}
                  >
                    Hidden
                  </span>
                )}
              </div>
              {result.runtime && (
                <span className={`text-xs ${t.textMuted}`}>
                  {result.runtime}ms
                </span>
              )}
            </div>

            {!result.isHidden && !result.passed && (
              <div className="space-y-1 text-sm font-mono">
                <div className={t.textMuted}>
                  Input: <span className={t.consoleText}>{result.input}</span>
                </div>
                <div className={t.textMuted}>
                  Expected:{' '}
                  <span className="text-green-400">
                    {result.expectedOutput}
                  </span>
                </div>
                <div className={t.textMuted}>
                  Got:{' '}
                  <span className="text-red-400">{result.actualOutput}</span>
                </div>
              </div>
            )}

            {result.error && (
              <div className="mt-2 text-sm text-red-400 font-mono">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ Question Description Component ============
const QuestionDescription = ({ question, t }) => (
  <div className={`space-y-6 ${t.textSecondary}`}>
    {/* Description */}
    {question.description && (
      <p className={`leading-relaxed text-base ${t.text}`}>
        {question.description}
      </p>
    )}

    {/* Problem Statement */}
    {question.problemStatement && (
      <div className={`${t.bgSecondary} p-5 rounded-xl border ${t.border}`}>
        <p className={`whitespace-pre-wrap ${t.text} leading-relaxed`}>
          {question.problemStatement}
        </p>
      </div>
    )}

    {/* Examples */}
    {question.examples?.length > 0 && (
      <div className="space-y-4">
        <h3
          className={`font-semibold ${t.text} text-sm uppercase tracking-wide`}
        >
          Examples
        </h3>
        {question.examples.map((example, idx) => (
          <div
            key={idx}
            className={`${t.bgSecondary} rounded-xl overflow-hidden border ${t.border}`}
          >
            <div
              className={`px-4 py-2.5 ${t.bgTertiary} text-sm font-semibold ${t.text} border-b ${t.border}`}
            >
              Example {idx + 1}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span
                  className={`${t.textMuted} text-sm font-medium min-w-[60px]`}
                >
                  Input:
                </span>
                <code
                  className={`text-sm ${t.bg} px-3 py-1.5 rounded-lg ${t.text} font-mono border ${t.border}`}
                >
                  {example.input}
                </code>
              </div>
              <div className="flex items-start gap-3">
                <span
                  className={`${t.textMuted} text-sm font-medium min-w-[60px]`}
                >
                  Output:
                </span>
                <code
                  className={`text-sm ${t.bg} px-3 py-1.5 rounded-lg ${t.text} font-mono border ${t.border}`}
                >
                  {example.output}
                </code>
              </div>
              {example.explanation && (
                <div className={`pt-3 border-t ${t.border} mt-3`}>
                  <span className={`${t.textMuted} text-sm font-medium`}>
                    Explanation:{' '}
                  </span>
                  <span className={`text-sm ${t.textSecondary}`}>
                    {example.explanation}
                  </span>
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
        <h3
          className={`font-semibold ${t.text} mb-3 text-sm uppercase tracking-wide`}
        >
          Constraints
        </h3>
        <ul className="space-y-2">
          {question.constraints.map((c, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <span
                className={`w-1.5 h-1.5 rounded-full ${t.accentText} bg-current`}
              />
              <code
                className={`text-sm ${t.bgSecondary} px-3 py-1.5 rounded-lg ${t.text} font-mono border ${t.border}`}
              >
                {c}
              </code>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Tags */}
    {(question.category || question.tags?.length > 0) && (
      <div className={`flex flex-wrap gap-2 pt-5 border-t ${t.border}`}>
        {question.category && (
          <span
            className={`px-3 py-1.5 ${t.accentBg} ${t.accentText} rounded-full text-xs font-medium`}
          >
            {question.category}
          </span>
        )}
        {question.tags?.map((tag, idx) => (
          <span
            key={idx}
            className={`px-3 py-1.5 ${t.bgTertiary} ${t.textSecondary} rounded-full text-xs font-medium`}
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ============ Hints Tab Component ============
const HintsTab = ({ hints, t }) => {
  const [openHint, setOpenHint] = useState(null);

  if (!hints?.length) {
    return (
      <div className={`flex items-center justify-center h-48 ${t.textMuted}`}>
        <div className="text-center">
          <FaLightbulb className="text-4xl mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hints available</p>
          <p className="text-sm mt-1">Try solving without hints first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hints.map((hint, idx) => (
        <div
          key={idx}
          className={`border ${t.border} rounded-xl overflow-hidden transition-all ${
            openHint === idx ? t.accentBg : t.bg
          }`}
        >
          <button
            onClick={() => setOpenHint(openHint === idx ? null : idx)}
            className={`w-full flex items-center justify-between p-4 ${t.buttonHover} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${t.warningBg}`}
              >
                <FaLightbulb className={`${t.warningText}`} size={14} />
              </div>
              <span className={`font-medium ${t.text}`}>
                Hint {hint.level || idx + 1}
              </span>
            </div>
            <div
              className={`transition-transform duration-200 ${openHint === idx ? 'rotate-180' : ''}`}
            >
              <FaChevronDown className={t.textMuted} size={12} />
            </div>
          </button>
          {openHint === idx && (
            <div
              className={`px-4 pb-4 ${t.textSecondary} border-t ${t.border} pt-4 mx-4 mb-4`}
            >
              <p className="leading-relaxed">
                {hint.text || hint.content || hint}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============ Submissions Tab Component ============
const SubmissionsTab = ({ submission, t }) => {
  if (!submission) {
    return (
      <div className={`flex items-center justify-center h-48 ${t.textMuted}`}>
        <div className="text-center">
          <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
          <p className="font-medium">No submissions yet</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-green-500';
      case 'wrong_answer':
        return 'text-red-500';
      case 'time_limit_exceeded':
        return 'text-yellow-500';
      default:
        return t.textSecondary;
    }
  };

  return (
    <div className="space-y-4">
      {/* Latest Submission */}
      <div className={`${t.bgSecondary} rounded-xl p-4 border ${t.border}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${t.text}`}>Latest Submission</h3>
          <span className={`text-sm ${getStatusColor(submission.status)}`}>
            {submission.statusDisplay || submission.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className={t.textMuted}>Test Cases:</span>
            <span className={`ml-2 ${t.text}`}>
              {submission.testResults?.passed}/{submission.testResults?.total}
            </span>
          </div>
          <div>
            <span className={t.textMuted}>Score:</span>
            <span className={`ml-2 ${t.text}`}>
              {submission.score?.percentage}%
            </span>
          </div>
          <div>
            <span className={t.textMuted}>Runtime:</span>
            <span className={`ml-2 ${t.text}`}>
              {submission.performance?.runtime}
            </span>
          </div>
          <div>
            <span className={t.textMuted}>Memory:</span>
            <span className={`ml-2 ${t.text}`}>
              {submission.performance?.memory}
            </span>
          </div>
          <div>
            <span className={t.textMuted}>Language:</span>
            <span className={`ml-2 ${t.text} capitalize`}>
              {submission.language}
            </span>
          </div>
          <div>
            <span className={t.textMuted}>Attempt:</span>
            <span className={`ml-2 ${t.text}`}>
              #{submission.attemptNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;
