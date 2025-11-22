import React, { useState } from 'react';
import { FaClock, FaCode, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const QuestionViewer = ({ questions }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-900/30 border-green-600';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
      case 'hard': return 'text-red-400 bg-red-900/30 border-red-600';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-600';
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <FaCode className="text-6xl mx-auto mb-4 text-gray-600" />
        <p className="text-lg">No questions assigned</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {questions.map((item, idx) => {
        const question = item.question;
        const isExpanded = expandedQuestion === idx;

        return (
          <div key={idx} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            {/* Question Header */}
            <button
              onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
              className="w-full p-4 text-left hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-mono font-bold">#{idx + 1}</span>
                    <h3 className="text-white font-semibold">
                      {question?.title || 'Question Title'}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {question?.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty.toUpperCase()}
                      </span>
                    )}
                    {question?.category && (
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-600 rounded text-xs font-semibold">
                        {question.category}
                      </span>
                    )}
                    {item.timeAllocated && (
                      <span className="px-2 py-1 bg-orange-900/30 text-orange-400 border border-orange-600 rounded text-xs font-semibold flex items-center gap-1">
                        <FaClock />
                        {item.timeAllocated} min
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-gray-400">
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-700 p-4 space-y-4 bg-gray-950">
                {/* Problem Statement */}
                {question?.problemStatement && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Problem</h4>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {question.problemStatement}
                    </p>
                  </div>
                )}

                {/* Examples */}
                {question?.examples && question.examples.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Examples</h4>
                    {question.examples.map((example, exIdx) => (
                      <div key={exIdx} className="bg-gray-900 rounded p-3 mb-2">
                        <div className="font-mono text-sm">
                          <div className="text-gray-400 mb-1">Input:</div>
                          <div className="text-green-400 mb-2">{example.input}</div>
                          <div className="text-gray-400 mb-1">Output:</div>
                          <div className="text-blue-400">{example.output}</div>
                          {example.explanation && (
                            <>
                              <div className="text-gray-400 mt-2 mb-1">Explanation:</div>
                              <div className="text-gray-300 text-xs">{example.explanation}</div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {question?.constraints && question.constraints.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Constraints</h4>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      {question.constraints.map((constraint, cIdx) => (
                        <li key={cIdx} className="font-mono text-xs">{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Complexity */}
                {question?.solution && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                      <div className="text-blue-400 text-xs mb-1">Time Complexity</div>
                      <div className="text-white font-mono font-bold">
                        {question.solution.timeComplexity}
                      </div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-700 rounded p-3">
                      <div className="text-purple-400 text-xs mb-1">Space Complexity</div>
                      <div className="text-white font-mono font-bold">
                        {question.solution.spaceComplexity}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuestionViewer;