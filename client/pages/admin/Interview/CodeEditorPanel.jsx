import React, { useState } from 'react';
import CodeEditor from '../Interview/CodeEditorPanel';

const CodeEditorPanel = ({ languages, questions, onClose }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [language, setLanguage] = useState(languages?.[0] || 'javascript');
  const [code, setCode] = useState('');

  const question = questions?.[selectedQuestion]?.question;

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Question Selector */}
      {questions && questions.length > 1 && (
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <select
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {questions.map((q, idx) => (
              <option key={idx} value={idx}>
                Question {idx + 1}: {q.question?.title || 'Untitled'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Code Editor - Force full width with wrapper */}
      <div className="flex-1 min-h-0 overflow-hidden [&>*]:!w-full [&>*]:!h-full">
        <CodeEditor
          question={question}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          visible={true}
          onClose={onClose || (() => {})}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;
