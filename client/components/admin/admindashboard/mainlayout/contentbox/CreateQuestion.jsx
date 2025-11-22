import React, { useState } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaCheck, FaCode, FaClock, FaMemory } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const CATEGORIES = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming',
  'Math', 'Sorting', 'Greedy', 'Depth-First Search',
  'Binary Search', 'Tree', 'Two Pointers', 'Binary Tree',
  'Bit Manipulation', 'Stack', 'Heap (Priority Queue)',
  'Graph', 'Backtracking', 'Sliding Window', 'Linked List',
];

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚡' },
];

const CreateQuestion = ({ editingQuestion, onUpdate, onCancel }) => {
  const [form, setForm] = useState(editingQuestion || getInitialForm());

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
    setForm(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const handleAddTestCase = () => {
    setForm(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }],
    }));
  };

  const handleRemoveTestCase = (index) => {
    setForm(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const handleAddConstraint = () => {
    setForm(prev => ({
      ...prev,
      constraints: [...prev.constraints, ''],
    }));
  };

  const handleRemoveConstraint = (index) => {
    setForm(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }));
  };

  const handleAddHint = () => {
    setForm(prev => ({
      ...prev,
      hints: [...prev.hints, { level: prev.hints.length + 1, text: '' }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaCode className="text-cyan-700" />
        {editingQuestion ? 'Edit Question' : 'Create New Question'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Question Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Two Sum"
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-700"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-700"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the problem"
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-700"
              rows="2"
            />
          </div>
        </div>

        {/* Problem Statement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Problem Statement</h3>
          
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Problem Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.problemStatement}
              onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
              placeholder="Detailed problem statement..."
              className="border border-gray-300 rounded-lg p-3 w-full font-mono text-sm focus:ring-2 focus:ring-cyan-700"
              rows="6"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Input Format</label>
              <textarea
                value={form.inputFormat}
                onChange={(e) => setForm({ ...form, inputFormat: e.target.value })}
                placeholder="Describe the input format"
                className="border border-gray-300 rounded-lg p-3 w-full font-mono text-sm focus:ring-2 focus:ring-cyan-700"
                rows="3"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Output Format</label>
              <textarea
                value={form.outputFormat}
                onChange={(e) => setForm({ ...form, outputFormat: e.target.value })}
                placeholder="Describe the output format"
                className="border border-gray-300 rounded-lg p-3 w-full font-mono text-sm focus:ring-2 focus:ring-cyan-700"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Constraints</h3>
            <button
              type="button"
              onClick={handleAddConstraint}
              className="text-cyan-700 hover:text-cyan-800 font-semibold text-sm"
            >
              + Add Constraint
            </button>
          </div>
          {form.constraints.map((constraint, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={constraint}
                onChange={(e) => {
                  const newConstraints = [...form.constraints];
                  newConstraints[index] = e.target.value;
                  setForm({ ...form, constraints: newConstraints });
                }}
                placeholder="e.g., 1 <= nums.length <= 10^4"
                className="border border-gray-300 rounded-lg p-2 flex-1 font-mono text-sm focus:ring-2 focus:ring-cyan-700"
              />
              {form.constraints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveConstraint(index)}
                  className="text-red-600 hover:text-red-700 px-3"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Examples</h3>
            <button
              type="button"
              onClick={handleAddExample}
              className="text-cyan-700 hover:text-cyan-800 font-semibold text-sm"
            >
              + Add Example
            </button>
          </div>
          {form.examples.map((example, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700">Example {index + 1}</span>
                {form.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExample(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-600">Input</label>
                  <textarea
                    value={example.input}
                    onChange={(e) => {
                      const newExamples = [...form.examples];
                      newExamples[index].input = e.target.value;
                      setForm({ ...form, examples: newExamples });
                    }}
                    placeholder="nums = [2,7,11,15], target = 9"
                    className="border border-gray-300 rounded p-2 w-full font-mono text-sm"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-600">Output</label>
                  <textarea
                    value={example.output}
                    onChange={(e) => {
                      const newExamples = [...form.examples];
                      newExamples[index].output = e.target.value;
                      setForm({ ...form, examples: newExamples });
                    }}
                    placeholder="[0,1]"
                    className="border border-gray-300 rounded p-2 w-full font-mono text-sm"
                    rows="2"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-semibold mb-1 text-gray-600">Explanation (Optional)</label>
                <textarea
                  value={example.explanation}
                  onChange={(e) => {
                    const newExamples = [...form.examples];
                    newExamples[index].explanation = e.target.value;
                    setForm({ ...form, examples: newExamples });
                  }}
                  placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                  className="border border-gray-300 rounded p-2 w-full text-sm"
                  rows="2"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Test Cases */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Test Cases</h3>
            <button
              type="button"
              onClick={handleAddTestCase}
              className="text-cyan-700 hover:text-cyan-800 font-semibold text-sm"
            >
              + Add Test Case
            </button>
          </div>
          {form.testCases.map((testCase, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700">Test Case {index + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
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
                  <label className="flex items-center gap-2 text-sm">
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
                  {form.testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-600">Input</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => {
                      const newTestCases = [...form.testCases];
                      newTestCases[index].input = e.target.value;
                      setForm({ ...form, testCases: newTestCases });
                    }}
                    className="border border-gray-300 rounded p-2 w-full font-mono text-sm"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-600">Expected Output</label>
                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(e) => {
                      const newTestCases = [...form.testCases];
                      newTestCases[index].expectedOutput = e.target.value;
                      setForm({ ...form, testCases: newTestCases });
                    }}
                    className="border border-gray-300 rounded p-2 w-full font-mono text-sm"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hints */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Hints (Progressive)</h3>
            <button
              type="button"
              onClick={handleAddHint}
              className="text-cyan-700 hover:text-cyan-800 font-semibold text-sm"
            >
              + Add Hint
            </button>
          </div>
          {form.hints.map((hint, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="bg-cyan-100 text-cyan-700 px-3 py-2 rounded font-semibold text-sm mt-1">
                Hint {hint.level}
              </span>
              <textarea
                value={hint.text}
                onChange={(e) => {
                  const newHints = [...form.hints];
                  newHints[index].text = e.target.value;
                  setForm({ ...form, hints: newHints });
                }}
                placeholder="Enter hint..."
                className="border border-gray-300 rounded-lg p-2 flex-1 text-sm focus:ring-2 focus:ring-cyan-700"
                rows="2"
              />
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            className="flex-1 bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow"
          >
            <FaCheck />
            {editingQuestion ? 'Update Question' : 'Create Question'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateQuestion;