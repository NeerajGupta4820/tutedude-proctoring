import React, { useState } from "react";
import { FaLightbulb, FaBook, FaExclamationCircle } from "react-icons/fa";

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
];

const CodeEditor = ({
  question,
  code,
  setCode,
  language,
  setLanguage,
  visible,
  onClose,
  style,
}) => {
  if (!visible) return null;
  return (
    <div className="flex-1 flex flex-col bg-white" style={style}>
      {/* Header */}
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FaBook className="text-cyan-700" />
            <h2 className="text-xl font-semibold">{question.title}</h2>
          </div>
          <p className="text-sm text-gray-500">{question.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 px-3 py-1 rounded bg-cyan-100 text-cyan-700 font-semibold">
            <FaLightbulb /> Examples
          </button>
          <button className="flex items-center gap-1 px-3 py-1 rounded bg-cyan-100 text-cyan-700 font-semibold">
            <FaExclamationCircle /> Constraints
          </button>
          <select
            className="ml-2 px-2 py-1 rounded border text-sm bg-gray-50"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {languageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-cyan-100 font-semibold"
            onClick={onClose}
            title="Close Editor"
          >
            Close
          </button>
        </div>
      </div>
      {/* Examples and Constraints */}
      <div className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="mb-2 font-semibold">Examples:</div>
          <ul className="space-y-2">
            {question.examples.map((ex, i) => (
              <li key={i} className="bg-gray-100 rounded p-2 text-sm">
                <div><span className="font-bold">Input:</span> {ex.input}</div>
                <div><span className="font-bold">Output:</span> {ex.output}</div>
                {ex.explanation && <div><span className="font-bold">Explanation:</span> {ex.explanation}</div>}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <div className="mb-2 font-semibold">Constraints:</div>
          <ul className="space-y-2">
            {question.constraints.map((c, i) => (
              <li key={i} className="bg-gray-100 rounded p-2 text-sm">{c}</li>
            ))}
          </ul>
        </div>
      </div>
      {/* Code Editor */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-2 font-semibold">Code Editor:</div>
        <textarea
          className="w-full h-64 border rounded p-2 font-mono text-sm bg-gray-50 focus:outline-cyan-700"
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
