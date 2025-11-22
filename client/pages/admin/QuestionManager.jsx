import React, { useState } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaCode, FaClock, FaMemory } from 'react-icons/fa';

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

const QuestionManager = ({ questions, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [form, setForm] = useState(getInitialForm());

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
      setShowForm(false);
      setEditingQuestion(null);
      setForm(getInitialForm());
      onUpdate();
    } catch (err) {
      console.error('Failed to save question:', err);
      alert('Failed to save question: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setForm({
      ...question,
      examples: question.examples.length > 0 ? question.examples : [{ input: '', output: '', explanation: '' }],
      testCases: question.testCases.length > 0 ? question.testCases : [{ input: '', expectedOutput: '', isHidden: false }],
      constraints: question.constraints.length > 0 ? question.constraints : [''],
      hints: question.hints?.length > 0 ? question.hints : [{ level: 1, text: '' }],
    });
    setShowForm(true);
  };

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
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingQuestion(null);
              setForm(getInitialForm());
            }}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow"
          >
            <FaPlus />
            {showForm ? 'Cancel' : 'New Question'}
          </button>
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

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-8 mb-6">
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

            {/* Starter Code */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Starter Code Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANGUAGES.map(lang => (
                  <div key={lang.id}>
                    <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <span>{lang.icon}</span>
                      {lang.name}
                    </label>
                    <textarea
                      value={form.starterCode[lang.id]?.code || ''}
                      onChange={(e) => setForm({
                        ...form,
                        starterCode: {
                          ...form.starterCode,
                          [lang.id]: {
                            ...form.starterCode[lang.id],
                            code: e.target.value,
                          }
                        }
                      })}
                      placeholder={`// ${lang.name} starter code\nfunction solution() {\n  // Your code here\n}`}
                      className="border border-gray-300 rounded-lg p-3 w-full font-mono text-sm focus:ring-2 focus:ring-cyan-700 bg-gray-900 text-green-400"
                      rows="6"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Solution & Complexity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Solution & Complexity</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <FaClock className="text-cyan-700" />
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    value={form.solution.timeComplexity}
                    onChange={(e) => setForm({
                      ...form,
                      solution: { ...form.solution, timeComplexity: e.target.value }
                    })}
                    placeholder="e.g., O(n)"
                    className="border border-gray-300 rounded-lg p-3 w-full font-mono focus:ring-2 focus:ring-cyan-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <FaMemory className="text-cyan-700" />
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    value={form.solution.spaceComplexity}
                    onChange={(e) => setForm({
                      ...form,
                      solution: { ...form.solution, spaceComplexity: e.target.value }
                    })}
                    placeholder="e.g., O(1)"
                    className="border border-gray-300 rounded-lg p-3 w-full font-mono focus:ring-2 focus:ring-cyan-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Solution Explanation</label>
                <textarea
                  value={form.solution.explanation}
                  onChange={(e) => setForm({
                    ...form,
                    solution: { ...form.solution, explanation: e.target.value }
                  })}
                  placeholder="Explain the approach and solution..."
                  className="border border-gray-300 rounded-lg p-3 w-full text-sm focus:ring-2 focus:ring-cyan-700"
                  rows="4"
                />
              </div>
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

            {/* Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Execution Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Time Limit (ms)</label>
                  <input
                    type="number"
                    value={form.timeLimit}
                    onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Memory Limit (MB)</label>
                  <input
                    type="number"
                    value={form.memoryLimit}
                    onChange={(e) => setForm({ ...form, memoryLimit: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-700"
                  />
                </div>
              </div>
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
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingQuestion(null);
                  setForm(getInitialForm());
                }}
                className="px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      {!showForm && (
        <div>
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
                        onClick={() => handleEdit(question)}
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