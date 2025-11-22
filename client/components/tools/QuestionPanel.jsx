import React from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const QuestionPanel = ({ questions, currentQuestionIndex, setCurrentQuestionIndex, onClose }) => {
  const question = questions[currentQuestionIndex];

  if (!question) {
    return (
      <div className="w-2/5 bg-white shadow-lg p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">DSA Questions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <FaTimes size={20} />
          </button>
        </div>
        <p className="text-gray-500">No questions assigned for this interview.</p>
      </div>
    );
  }

  return (
    <div className="w-2/5 bg-white shadow-lg p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">DSA Questions</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Question Navigation */}
      {questions.length > 1 && (
        <div className="flex justify-between items-center mb-4 bg-gray-100 p-3 rounded">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="p-2 bg-cyan-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <button
            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
            className="p-2 bg-cyan-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Question Content */}
      <div className="space-y-4">
        {/* Title and Difficulty */}
        <div className="border-b pb-3">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h3>
          <div className="flex gap-2 items-center">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {question.difficulty?.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-700">
              {question.category}
            </span>
          </div>
        </div>

        {/* Description */}
        {question.description && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Description:</h4>
            <p className="text-gray-600">{question.description}</p>
          </div>
        )}

        {/* Problem Statement */}
        {question.problemStatement && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Problem Statement:</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{question.problemStatement}</p>
          </div>
        )}

        {/* Input/Output Format */}
        <div className="grid grid-cols-2 gap-4">
          {question.inputFormat && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Input Format:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {question.inputFormat}
              </pre>
            </div>
          )}
          {question.outputFormat && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Output Format:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {question.outputFormat}
              </pre>
            </div>
          )}
        </div>

        {/* Examples */}
        {question.examples && question.examples.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Examples:</h4>
            {question.examples.map((example, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded mb-2 border-l-4 border-cyan-500">
                <p className="mb-1"><strong>Input:</strong> <code className="bg-white px-2 py-1 rounded">{example.input}</code></p>
                <p className="mb-1"><strong>Output:</strong> <code className="bg-white px-2 py-1 rounded">{example.output}</code></p>
                {example.explanation && (
                  <p className="text-sm text-gray-600 mt-2"><strong>Explanation:</strong> {example.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {question.constraints && question.constraints.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Constraints:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {question.constraints.map((constraint, idx) => (
                <li key={idx}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Hints */}
        {question.hints && question.hints.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Hints:</h4>
            {question.hints.map((hint, idx) => (
              <details key={idx} className="bg-yellow-50 p-3 rounded mb-2 cursor-pointer">
                <summary className="font-medium text-yellow-800">Hint {hint.level}</summary>
                <p className="text-gray-600 mt-2">{hint.text}</p>
              </details>
            ))}
          </div>
        )}

        {/* Test Cases */}
        {question.testCases && question.testCases.filter(tc => tc.isSample).length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Sample Test Cases:</h4>
            {question.testCases.filter(tc => tc.isSample).map((tc, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded mb-2">
                <p className="mb-1"><strong>Input:</strong> <code className="bg-white px-2 py-1 rounded text-sm">{tc.input}</code></p>
                <p><strong>Expected Output:</strong> <code className="bg-white px-2 py-1 rounded text-sm">{tc.expectedOutput}</code></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;