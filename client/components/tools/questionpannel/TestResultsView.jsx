import React from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMemory,
} from 'react-icons/fa';

const TestResultsView = ({ testResults, t }) => {
  if (!testResults) return null;

  const { testResults: results, summary } = testResults;

  return (
    <div className="p-4">
      {/* Summary Section */}
      <div
        className={`flex items-center gap-4 mb-4 pb-3 border-b ${t.outputBorder}`}
      >
        <div className="flex items-center gap-2">
          {summary?.passed === summary?.totalTests ? (
            <FaCheckCircle className="text-green-500" size={18} />
          ) : (
            <FaTimesCircle className="text-red-500" size={18} />
          )}
          <span className={`${t.outputText} font-medium`}>
            {summary?.passed}/{summary?.totalTests} test cases passed
          </span>
        </div>

        {summary?.avgRuntime && (
          <div className={`flex items-center gap-1 ${t.textSecondary} text-sm`}>
            <FaClock size={12} />
            <span>{summary.runtimeDisplay}</span>
          </div>
        )}

        {summary?.avgMemory && (
          <div className={`flex items-center gap-1 ${t.textSecondary} text-sm`}>
            <FaMemory size={12} />
            <span>{summary.memoryDisplay}</span>
          </div>
        )}
      </div>

      {/* Individual Test Cases */}
      <div className="space-y-2">
        {results?.slice(0, 10).map((result, index) => (
          <TestCaseItem key={index} result={result} index={index} t={t} />
        ))}
      </div>
    </div>
  );
};

// Test Case Item Sub-component
const TestCaseItem = ({ result, index, t }) => {
  return (
    <div
      className={`p-3 rounded-lg border ${
        result.passed
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {result.passed ? (
            <FaCheckCircle className="text-green-500" size={14} />
          ) : (
            <FaTimesCircle className="text-red-500" size={14} />
          )}
          <span className={`${t.outputText} font-medium text-sm`}>
            Test Case {result.testCaseIndex || index + 1}
          </span>
          {result.isHidden && (
            <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-gray-200">
              Hidden
            </span>
          )}
        </div>
        {result.runtime && (
          <span className={`text-xs ${t.textSecondary}`}>
            {result.runtime}ms
          </span>
        )}
      </div>

      {/* Failed Test Details */}
      {!result.isHidden && !result.passed && (
        <div className="space-y-1 text-sm font-mono">
          <div className={t.textSecondary}>
            Input: <span className={t.outputText}>{result.input}</span>
          </div>
          <div className={t.textSecondary}>
            Expected:{' '}
            <span className="text-green-600">{result.expectedOutput}</span>
          </div>
          <div className={t.textSecondary}>
            Got: <span className="text-red-600">{result.actualOutput}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {result.error && (
        <div className="mt-2 text-sm text-red-600 font-mono">
          Error: {result.error}
        </div>
      )}
    </div>
  );
};

export default TestResultsView;
