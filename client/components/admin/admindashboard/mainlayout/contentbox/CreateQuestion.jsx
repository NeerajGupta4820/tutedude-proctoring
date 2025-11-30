import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaCheck, FaPlus, FaCode, FaLightbulb, FaBook, FaFlask, FaBolt } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const CATEGORIES = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming',
  'Math', 'Sorting', 'Greedy', 'Depth-First Search',
  'Binary Search', 'Tree', 'Two Pointers', 'Binary Tree',
  'Bit Manipulation', 'Stack', 'Heap (Priority Queue)',
  'Graph', 'Backtracking', 'Sliding Window', 'Linked List',
];

const CreateQuestion = ({ editingQuestion, onUpdate, onCancel }) => {
  const [form, setForm] = useState(editingQuestion || getInitialForm());
  const [loading, setLoading] = useState(false);

  function getInitialForm() {
    return {
      title: '',
      description: '',
      difficulty: 'medium',
      category: 'Array',
      tags: [],
      problemStatement: '',
      inputFormat: '',
      outputFormat: '',
      constraints: [''],
      examples: [{ input: '', output: '', explanation: '' }],
      testCases: [{ input: '', expectedOutput: '', isHidden: false, isSample: true }],
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: { code: '', functionName: 'solution' },
        python: { code: '', functionName: 'solution' },
        java: { code: '', className: 'Solution', functionName: 'solution' },
        cpp: { code: '', functionName: 'solution' },
      },
      solution: {
        timeComplexity: '',
        spaceComplexity: '',
        explanation: '',
        code: {
          javascript: '',
          python: '',
          java: '',
          cpp: '',
        },
      },
      hints: [{ level: 1, text: '' }],
      timeLimit: 3000,
      memoryLimit: 256,
    };
  }

  const handleAddExample = () => {
    setForm(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }],
    }));
  };

  const handleRemoveExample = (index) => {
    if (form.examples.length > 1) {
      setForm(prev => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddTestCase = () => {
    setForm(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false, isSample: false }],
    }));
  };

  const handleRemoveTestCase = (index) => {
    if (form.testCases.length > 1) {
      setForm(prev => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddConstraint = () => {
    setForm(prev => ({
      ...prev,
      constraints: [...prev.constraints, ''],
    }));
  };

  const handleRemoveConstraint = (index) => {
    if (form.constraints.length > 1) {
      setForm(prev => ({
        ...prev,
        constraints: prev.constraints.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddHint = () => {
    setForm(prev => ({
      ...prev,
      hints: [...prev.hints, { level: prev.hints.length + 1, text: '' }],
    }));
  };

  const handleRemoveHint = (index) => {
    if (form.hints.length > 1) {
      setForm(prev => ({
        ...prev,
        hints: prev.hints.filter((_, i) => i !== index).map((h, idx) => ({ ...h, level: idx + 1 })),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingQuestion) {
        await axios.patch(`${API_URL}/question/${editingQuestion._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/question`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onUpdate();
      if (onCancel) onCancel();
    } catch (err) {
      console.error('Failed to save question:', err);
      alert('Failed to save question: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'from-green-500 to-green-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'hard': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className={`bg-gradient-to-r ${getDifficultyColor(form.difficulty)} rounded-xl p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {editingQuestion ? 'Edit Question' : 'New DSA Question'}
            </h1>
            <p className="text-white/90">
              {editingQuestion ? 'Update question details and settings' : 'Create a new coding challenge for interviews'}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg px-4 py-2 font-semibold cursor-pointer"
            >
              <option value="easy" className="text-gray-900">Easy</option>
              <option value="medium" className="text-gray-900">Medium</option>
              <option value="hard" className="text-gray-900">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaCode className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Question Details</h2>
                <p className="text-xs text-gray-600">Title, category and basic information</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Two Sum, Reverse Linked List"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="One line summary"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Problem Statement Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <FaBook className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Problem Statement</h2>
                <p className="text-xs text-gray-600">Describe the problem in detail</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <textarea
              value={form.problemStatement}
              onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
              placeholder="Write a detailed problem description here..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all font-mono text-sm"
              rows="6"
              required
            />
          </div>
        </div>

        {/* Constraints Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <FaBolt className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Constraints</h2>
                  <p className="text-xs text-gray-600">Define input/output limits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddConstraint}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaPlus className="text-xs" /> Add
              </button>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {form.constraints.map((constraint, index) => (
              <div key={index} className="flex gap-3 items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={constraint}
                  onChange={(e) => {
                    const newConstraints = [...form.constraints];
                    newConstraints[index] = e.target.value;
                    setForm({ ...form, constraints: newConstraints });
                  }}
                  placeholder="e.g., 1 <= nums.length <= 10^4"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all font-mono text-sm"
                />
                {form.constraints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveConstraint(index)}
                    className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Examples Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaCode className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Examples</h2>
                  <p className="text-xs text-gray-600">Show sample inputs and outputs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddExample}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaPlus className="text-xs" /> Add Example
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {form.examples.map((example, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-gray-900">Example {index + 1}</span>
                  </div>
                  {form.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(index)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Input</label>
                    <textarea
                      value={example.input}
                      onChange={(e) => {
                        const newExamples = [...form.examples];
                        newExamples[index].input = e.target.value;
                        setForm({ ...form, examples: newExamples });
                      }}
                      placeholder="nums = [2,7,11,15]"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm bg-gray-900 text-green-400"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Output</label>
                    <textarea
                      value={example.output}
                      onChange={(e) => {
                        const newExamples = [...form.examples];
                        newExamples[index].output = e.target.value;
                        setForm({ ...form, examples: newExamples });
                      }}
                      placeholder="[0,1]"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm bg-gray-900 text-green-400"
                      rows="2"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Explanation</label>
                  <textarea
                    value={example.explanation}
                    onChange={(e) => {
                      const newExamples = [...form.examples];
                      newExamples[index].explanation = e.target.value;
                      setForm({ ...form, examples: newExamples });
                    }}
                    placeholder="Explain the example..."
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Cases Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <FaFlask className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Test Cases</h2>
                  <p className="text-xs text-gray-600">Define validation test cases</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaPlus className="text-xs" /> Add Test
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {form.testCases.map((testCase, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-indigo-50/50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border-2 border-gray-200 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={testCase.isSample}
                          onChange={(e) => {
                            const newTestCases = [...form.testCases];
                            newTestCases[index].isSample = e.target.checked;
                            setForm({ ...form, testCases: newTestCases });
                          }}
                          className="rounded"
                        />
                        Sample
                      </label>
                      <label className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border-2 border-gray-200 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={testCase.isHidden}
                          onChange={(e) => {
                            const newTestCases = [...form.testCases];
                            newTestCases[index].isHidden = e.target.checked;
                            setForm({ ...form, testCases: newTestCases });
                          }}
                          className="rounded"
                        />
                        Hidden
                      </label>
                    </div>
                  </div>
                  {form.testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(index)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Input</label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) => {
                        const newTestCases = [...form.testCases];
                        newTestCases[index].input = e.target.value;
                        setForm({ ...form, testCases: newTestCases });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Expected Output</label>
                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(e) => {
                        const newTestCases = [...form.testCases];
                        newTestCases[index].expectedOutput = e.target.value;
                        setForm({ ...form, testCases: newTestCases });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hints Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <FaLightbulb className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Hints</h2>
                  <p className="text-xs text-gray-600">Progressive hints to help candidates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddHint}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaPlus className="text-xs" /> Add Hint
              </button>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {form.hints.map((hint, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  {hint.level}
                </div>
                <textarea
                  value={hint.text}
                  onChange={(e) => {
                    const newHints = [...form.hints];
                    newHints[index].text = e.target.value;
                    setForm({ ...form, hints: newHints });
                  }}
                  placeholder="Enter helpful hint..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                  rows="2"
                />
                {form.hints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHint(index)}
                    className="flex-shrink-0 w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex gap-4 justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-12 py-3 bg-gradient-to-r ${getDifficultyColor(form.difficulty)} text-white rounded-xl font-semibold shadow-lg transition-all flex items-center gap-3 disabled:opacity-50`}
            >
              <FaCheck />
              {loading ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Create Question')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestion;