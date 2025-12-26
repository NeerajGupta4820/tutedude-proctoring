import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTimes,
  FaPlus,
  FaCode,
  FaLightbulb,
  FaBook,
  FaFlask,
  FaBolt,
  FaSave,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaFire,
  FaEdit,
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

// ✅ MOVED OUTSIDE - Categories array
const CATEGORIES = [
  'Array',
  'String',
  'Hash Table',
  'Dynamic Programming',
  'Math',
  'Sorting',
  'Greedy',
  'Depth-First Search',
  'Binary Search',
  'Tree',
  'Two Pointers',
  'Binary Tree',
  'Bit Manipulation',
  'Stack',
  'Heap (Priority Queue)',
  'Graph',
  'Backtracking',
  'Sliding Window',
  'Linked List',
];

// ✅ MOVED OUTSIDE - Card Component
const Card = ({
  icon: Icon,
  title,
  subtitle,
  iconBg,
  headerBg,
  children,
  action,
}) => (
  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden hover:border-blue-200 transition-colors">
    <div className={`${headerBg} px-5 py-4 border-b border-gray-100`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
          >
            <Icon className="text-white" size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ✅ MOVED OUTSIDE - Helper function for difficulty styles
const getDifficultyStyles = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return {
        bg: 'bg-green-600',
        text: 'text-green-600',
        icon: <FaCheckCircle size={16} />,
      };
    case 'medium':
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-600',
        icon: <FaExclamationCircle size={16} />,
      };
    case 'hard':
      return {
        bg: 'bg-red-600',
        text: 'text-red-600',
        icon: <FaFire size={16} />,
      };
    default:
      return { bg: 'bg-gray-600', text: 'text-gray-600', icon: null };
  }
};

// ✅ MOVED OUTSIDE - Initial form state generator
const getInitialFormState = (question) => ({
  title: question?.title || '',
  description: question?.description || '',
  difficulty: question?.difficulty || 'medium',
  category: question?.category || 'Array',
  tags: question?.tags || [],
  problemStatement: question?.problemStatement || '',
  inputFormat: question?.inputFormat || '',
  outputFormat: question?.outputFormat || '',
  constraints: question?.constraints?.length > 0 ? question.constraints : [''],
  examples:
    question?.examples?.length > 0
      ? question.examples
      : [{ input: '', output: '', explanation: '' }],
  testCases:
    question?.testCases?.length > 0
      ? question.testCases
      : [{ input: '', expectedOutput: '', isHidden: false, isSample: true }],
  supportedLanguages: question?.supportedLanguages || [
    'javascript',
    'python',
    'java',
    'cpp',
  ],
  starterCode: question?.starterCode || {
    javascript: { code: '', functionName: 'solution' },
    python: { code: '', functionName: 'solution' },
    java: { code: '', className: 'Solution', functionName: 'solution' },
    cpp: { code: '', functionName: 'solution' },
  },
  solution: question?.solution || {
    timeComplexity: '',
    spaceComplexity: '',
    explanation: '',
    code: { javascript: '', python: '', java: '', cpp: '' },
  },
  hints:
    question?.hints?.length > 0 ? question.hints : [{ level: 1, text: '' }],
  timeLimit: question?.timeLimit || 3000,
  memoryLimit: question?.memoryLimit || 256,
});

const UpdateQuestion = ({ question, onUpdate, onCancel }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      setForm(getInitialFormState(question));
    }
  }, [question]);

  // Loading state
  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-blue-200">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">
              Loading question data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form field change handler
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Constraint handlers
  const handleAddConstraint = () => {
    setForm((prev) => ({ ...prev, constraints: [...prev.constraints, ''] }));
  };

  const handleRemoveConstraint = (index) => {
    if (form.constraints.length > 1) {
      setForm((prev) => ({
        ...prev,
        constraints: prev.constraints.filter((_, i) => i !== index),
      }));
    }
  };

  const handleConstraintChange = (index, value) => {
    setForm((prev) => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = value;
      return { ...prev, constraints: newConstraints };
    });
  };

  // Example handlers
  const handleAddExample = () => {
    setForm((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }],
    }));
  };

  const handleRemoveExample = (index) => {
    if (form.examples.length > 1) {
      setForm((prev) => ({
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index),
      }));
    }
  };

  const handleExampleChange = (index, field, value) => {
    setForm((prev) => {
      const newExamples = [...prev.examples];
      newExamples[index] = { ...newExamples[index], [field]: value };
      return { ...prev, examples: newExamples };
    });
  };

  // Test case handlers
  const handleAddTestCase = () => {
    setForm((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { input: '', expectedOutput: '', isHidden: false, isSample: false },
      ],
    }));
  };

  const handleRemoveTestCase = (index) => {
    if (form.testCases.length > 1) {
      setForm((prev) => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index),
      }));
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    setForm((prev) => {
      const newTestCases = [...prev.testCases];
      newTestCases[index] = { ...newTestCases[index], [field]: value };
      return { ...prev, testCases: newTestCases };
    });
  };

  // Hint handlers
  const handleAddHint = () => {
    setForm((prev) => ({
      ...prev,
      hints: [...prev.hints, { level: prev.hints.length + 1, text: '' }],
    }));
  };

  const handleRemoveHint = (index) => {
    if (form.hints.length > 1) {
      setForm((prev) => ({
        ...prev,
        hints: prev.hints
          .filter((_, i) => i !== index)
          .map((h, idx) => ({ ...h, level: idx + 1 })),
      }));
    }
  };

  const handleHintChange = (index, value) => {
    setForm((prev) => {
      const newHints = [...prev.hints];
      newHints[index] = { ...newHints[index], text: value };
      return { ...prev, hints: newHints };
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/question/${question._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
      if (onCancel) onCancel();
    } catch (err) {
      alert(
        'Failed to update question: ' +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const difficultyStyles = getDifficultyStyles(form.difficulty);

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaEdit className="text-blue-600" size={18} />
              <h1 className="text-xl font-bold text-gray-900">Edit Question</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Update DSA question details for:{' '}
              <span className="font-medium text-gray-700">
                {question.title}
              </span>
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-medium transition-all"
            >
              <FaArrowLeft size={12} />
              <span>Back to Questions</span>
            </button>
          )}
        </div>

        <div className="max-w-6xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Difficulty Header */}
              <div
                className={`${difficultyStyles.bg} rounded-xl p-5 text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaEdit size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Editing Question</h2>
                      <p className="text-white/80 text-sm">
                        {form.title || 'Untitled Question'} • {form.category}
                      </p>
                    </div>
                  </div>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      handleFieldChange('difficulty', e.target.value)
                    }
                    className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2.5 font-medium text-sm cursor-pointer focus:outline-none"
                  >
                    <option value="easy" className="text-gray-900">
                      🟢 Easy
                    </option>
                    <option value="medium" className="text-gray-900">
                      🟡 Medium
                    </option>
                    <option value="hard" className="text-gray-900">
                      🔴 Hard
                    </option>
                  </select>
                </div>
              </div>

              {/* Question Details */}
              <Card
                icon={FaCode}
                title="Question Details"
                subtitle="Title, category and basic information"
                iconBg="bg-blue-600"
                headerBg="bg-blue-50"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Question Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        handleFieldChange('title', e.target.value)
                      }
                      placeholder="e.g., Two Sum, Reverse Linked List"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          handleFieldChange('category', e.target.value)
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={form.description}
                        onChange={(e) =>
                          handleFieldChange('description', e.target.value)
                        }
                        placeholder="One line summary"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Problem Statement */}
              <Card
                icon={FaBook}
                title="Problem Statement"
                subtitle="Describe the problem in detail"
                iconBg="bg-purple-600"
                headerBg="bg-purple-50"
              >
                <textarea
                  value={form.problemStatement}
                  onChange={(e) =>
                    handleFieldChange('problemStatement', e.target.value)
                  }
                  placeholder="Write a detailed problem description here..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-mono"
                  rows={6}
                  required
                />
              </Card>

              {/* Constraints */}
              <Card
                icon={FaBolt}
                title="Constraints"
                subtitle="Define input/output limits"
                iconBg="bg-orange-500"
                headerBg="bg-orange-50"
                action={
                  <button
                    type="button"
                    onClick={handleAddConstraint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                  >
                    <FaPlus size={10} />
                    <span>Add</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {form.constraints.map((constraint, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) =>
                          handleConstraintChange(index, e.target.value)
                        }
                        placeholder="e.g., 1 <= nums.length <= 10^4"
                        className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-mono"
                      />
                      {form.constraints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveConstraint(index)}
                          className="w-8 h-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Examples */}
              <Card
                icon={FaCode}
                title="Examples"
                subtitle="Show sample inputs and outputs"
                iconBg="bg-green-600"
                headerBg="bg-green-50"
                action={
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    <FaPlus size={10} />
                    <span>Add</span>
                  </button>
                }
              >
                <div className="space-y-4">
                  {form.examples.map((example, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            Example {index + 1}
                          </span>
                        </div>
                        {form.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(index)}
                            className="w-7 h-7 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <FaTimes size={11} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Input
                          </label>
                          <textarea
                            value={example.input}
                            onChange={(e) =>
                              handleExampleChange(
                                index,
                                'input',
                                e.target.value
                              )
                            }
                            placeholder="nums = [2,7,11,15]"
                            className="w-full px-3 py-2.5 bg-gray-900 text-green-400 border border-gray-700 rounded-lg font-mono text-sm"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Output
                          </label>
                          <textarea
                            value={example.output}
                            onChange={(e) =>
                              handleExampleChange(
                                index,
                                'output',
                                e.target.value
                              )
                            }
                            placeholder="[0,1]"
                            className="w-full px-3 py-2.5 bg-gray-900 text-blue-400 border border-gray-700 rounded-lg font-mono text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Explanation
                        </label>
                        <textarea
                          value={example.explanation}
                          onChange={(e) =>
                            handleExampleChange(
                              index,
                              'explanation',
                              e.target.value
                            )
                          }
                          placeholder="Explain the example..."
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Test Cases */}
              <Card
                icon={FaFlask}
                title="Test Cases"
                subtitle="Define validation test cases"
                iconBg="bg-indigo-600"
                headerBg="bg-indigo-50"
                action={
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <FaPlus size={10} />
                    <span>Add</span>
                  </button>
                }
              >
                <div className="space-y-4">
                  {form.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="bg-indigo-50 rounded-xl p-4 border border-indigo-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                          <div className="flex gap-2">
                            <label className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200 text-xs font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={testCase.isSample}
                                onChange={(e) =>
                                  handleTestCaseChange(
                                    index,
                                    'isSample',
                                    e.target.checked
                                  )
                                }
                                className="rounded text-indigo-600 border-gray-300"
                              />
                              Sample
                            </label>
                            <label className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200 text-xs font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={testCase.isHidden}
                                onChange={(e) =>
                                  handleTestCaseChange(
                                    index,
                                    'isHidden',
                                    e.target.checked
                                  )
                                }
                                className="rounded text-indigo-600 border-gray-300"
                              />
                              Hidden
                            </label>
                          </div>
                        </div>
                        {form.testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(index)}
                            className="w-7 h-7 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <FaTimes size={11} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Input
                          </label>
                          <textarea
                            value={testCase.input}
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                'input',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Expected Output
                          </label>
                          <textarea
                            value={testCase.expectedOutput}
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                'expectedOutput',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Hints */}
              <Card
                icon={FaLightbulb}
                title="Hints"
                subtitle="Progressive hints to help candidates"
                iconBg="bg-yellow-500"
                headerBg="bg-yellow-50"
                action={
                  <button
                    type="button"
                    onClick={handleAddHint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors"
                  >
                    <FaPlus size={10} />
                    <span>Add</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {form.hints.map((hint, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {hint.level}
                      </div>
                      <textarea
                        value={hint.text}
                        onChange={(e) =>
                          handleHintChange(index, e.target.value)
                        }
                        placeholder="Enter helpful hint..."
                        className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        rows={2}
                      />
                      {form.hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHint(index)}
                          className="w-9 h-9 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions Card */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${difficultyStyles.bg} rounded-lg flex items-center justify-center text-white`}
                    >
                      {difficultyStyles.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {form.title || 'Editing Question'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {form.category} • {form.difficulty} • ID:{' '}
                        {question._id?.slice(-6)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {onCancel && (
                      <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        <FaTimes size={12} />
                        <span>Cancel</span>
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex items-center gap-2 px-6 py-2.5 ${difficultyStyles.bg} hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FaSave size={12} />
                          <span>Update Question</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateQuestion;
