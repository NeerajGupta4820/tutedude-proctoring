import React from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExpand,
  FaCompress,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaPalette,
} from 'react-icons/fa';

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
      {/* Left Section */}
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

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Selector */}
        <ThemeSelector
          t={t}
          themes={themes}
          theme={theme}
          setTheme={setTheme}
          showThemeMenu={showThemeMenu}
          setShowThemeMenu={setShowThemeMenu}
        />

        {/* Interviewer Controls */}
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

        {/* Close Button */}
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

// Theme Selector Sub-component
const ThemeSelector = ({
  t,
  themes,
  theme,
  setTheme,
  showThemeMenu,
  setShowThemeMenu,
}) => {
  return (
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
                    className={theme === key ? t.accentText : t.textSecondary}
                  />
                  <span className={theme === key ? t.accentText : ''}>
                    {themeOption.name}
                  </span>
                  {theme === key && (
                    <FaCheck size={10} className={`ml-auto ${t.accentText}`} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
