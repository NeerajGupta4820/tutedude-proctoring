import React, { useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaCode, FaClock, FaMemory, FaTimes, FaEye } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const QuestionManager = ({ questions, onUpdate, onEdit }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/question/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'all') return true;
    return q.difficulty === activeTab;
  });

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div>
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">DSA Questions</h2>
            <p className="text-xs text-gray-600 mt-0.5">{questions.length} problems available</p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-sm font-semibold text-green-600">
                {questions.filter(q => q.difficulty === 'easy').length}
              </div>
              <div className="text-xs text-gray-500">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-yellow-600">
                {questions.filter(q => q.difficulty === 'medium').length}
              </div>
              <div className="text-xs text-gray-500">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-red-600">
                {questions.filter(q => q.difficulty === 'hard').length}
              </div>
              <div className="text-xs text-gray-500">Hard</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 bg-gray-100 p-1 rounded-lg">
          {['all', 'easy', 'medium', 'hard'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded transition-colors text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              {tab}
              {tab !== 'all' && (
                <span className="ml-1.5 text-xs">
                  ({questions.filter(q => q.difficulty === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-600">
            <FaCode className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900">No questions found</p>
            <p className="text-sm mt-2">Create your first DSA question to get started</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left - Number & Title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-lg font-mono text-gray-400 font-semibold flex-shrink-0 mt-0.5">
                    #{question.questionNumber || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {question.title}
                    </h3>
                    {question.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {question.description}
                      </p>
                    )}
                    {/* Tags */}
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {question.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right - Actions */}
                <div className="flex gap-2 justify-end flex-shrink-0">
                  <button
                    onClick={() => setSelectedQuestion(question)}
                    className="text-gray-600 bg-gray-100 px-3 py-2 rounded-lg text-sm border border-gray-200 transition-colors flex items-center gap-1.5"
                    title="View Details"
                  >
                    <FaEye size={14} />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button
                    onClick={() => onEdit(question)}
                    className="text-cyan-600 bg-cyan-50 px-3 py-2 rounded-lg text-sm border border-cyan-200 transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm border border-red-200 transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Preview Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start z-10">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-mono text-gray-400 font-semibold">
                    #{selectedQuestion.questionNumber}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedQuestion.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded text-xs font-medium border ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded text-xs font-medium">
                    {selectedQuestion.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Problem Statement */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Problem Statement</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedQuestion.problemStatement}
                </p>
              </div>

              {/* Examples */}
              {selectedQuestion.examples?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Examples</h3>
                  <div className="space-y-3">
                    {selectedQuestion.examples.map((example, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="font-medium text-gray-900 mb-2 text-sm">Example {idx + 1}</div>
                        <div className="font-mono text-xs bg-gray-900 text-green-400 p-3 rounded mb-2">
                          <div className="mb-1">
                            <span className="text-gray-400">Input:</span> {example.input}
                          </div>
                          <div>
                            <span className="text-gray-400">Output:</span> {example.output}
                          </div>
                        </div>
                        {example.explanation && (
                          <div className="text-xs text-gray-600 mt-2">
                            <span className="font-medium text-gray-700">Explanation:</span> {example.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {selectedQuestion.constraints?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1.5 font-mono text-xs text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedQuestion.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complexity */}
              {selectedQuestion.solution && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Complexity Analysis</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-cyan-600 text-sm" />
                        <span className="font-medium text-cyan-900 text-sm">Time Complexity</span>
                      </div>
                      <p className="font-mono text-base text-cyan-700 font-semibold">
                        {selectedQuestion.solution.timeComplexity || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMemory className="text-purple-600 text-sm" />
                        <span className="font-medium text-purple-900 text-sm">Space Complexity</span>
                      </div>
                      <p className="font-mono text-base text-purple-700 font-semibold">
                        {selectedQuestion.solution.spaceComplexity || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Solution Explanation */}
              {selectedQuestion.solution?.explanation && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Solution Approach</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedQuestion.solution.explanation}
                  </p>
                </div>
              )}

              {/* Hints */}
              {selectedQuestion.hints?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Hints</h3>
                  <div className="space-y-2">
                    {selectedQuestion.hints.map((hint, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">
                            Hint {hint.level}
                          </span>
                          <p className="text-sm text-gray-700">{hint.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onEdit(selectedQuestion);
                  setSelectedQuestion(null);
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Edit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;