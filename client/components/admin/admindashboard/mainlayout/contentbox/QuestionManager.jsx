import React, { useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaCode, FaClock, FaMemory } from 'react-icons/fa';

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
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-700">DSA Questions</h2>
            <p className="text-gray-600 mt-1">{questions.length} problems available</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          {['all', 'easy', 'medium', 'hard'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-cyan-700 shadow'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {tab}
              {tab !== 'all' && (
                <span className="ml-2 text-sm">
                  ({questions.filter(q => q.difficulty === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center text-gray-600">
            <FaCode className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl font-semibold text-gray-900">No questions found</p>
            <p className="text-sm mt-2">Create your first DSA question to get started</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left - Number & Title */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="text-2xl font-mono text-gray-500 font-bold">
                    #{question.questionNumber || index + 1}
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => setSelectedQuestion(question)}
                      className="text-left"
                    >
                      <h3 className="font-bold text-gray-900 hover:text-cyan-700 transition-colors text-lg">
                        {question.title}
                      </h3>
                      {question.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {question.description}
                        </p>
                      )}
                    </button>
                  </div>
                </div>

                {/* Middle - Category & Difficulty */}
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700">
                    {question.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Right - Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(question)}
                    className="text-cyan-700 hover:text-cyan-800 p-2 hover:bg-cyan-50 rounded transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={18} />
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
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedQuestion.questionNumber}. {selectedQuestion.title}
              </h2>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Difficulty & Category */}
              <div className="flex gap-3">
                <span className={`px-4 py-2 rounded-lg font-bold ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {selectedQuestion.difficulty.toUpperCase()}
                </span>
                <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg font-semibold">
                  {selectedQuestion.category}
                </span>
              </div>

              {/* Problem Statement */}
              <div>
                <h3 className="font-bold text-lg mb-2">Problem</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.problemStatement}</p>
              </div>

              {/* Examples */}
              {selectedQuestion.examples?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Examples</h3>
                  {selectedQuestion.examples.map((example, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
                      <div className="font-semibold mb-2">Example {idx + 1}:</div>
                      <div className="font-mono text-sm bg-gray-900 text-green-400 p-3 rounded mb-2">
                        <div><span className="text-gray-400">Input:</span> {example.input}</div>
                        <div><span className="text-gray-400">Output:</span> {example.output}</div>
                      </div>
                      {example.explanation && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-semibold">Explanation:</span> {example.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {selectedQuestion.constraints?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 font-mono text-sm text-gray-700">
                    {selectedQuestion.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complexity */}
              {selectedQuestion.solution && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock className="text-cyan-700" />
                      <span className="font-semibold text-cyan-900">Time Complexity</span>
                    </div>
                    <p className="font-mono text-lg text-cyan-700">{selectedQuestion.solution.timeComplexity}</p>
                  </div>
                  <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMemory className="text-cyan-700" />
                      <span className="font-semibold text-cyan-900">Space Complexity</span>
                    </div>
                    <p className="font-mono text-lg text-cyan-700">{selectedQuestion.solution.spaceComplexity}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;