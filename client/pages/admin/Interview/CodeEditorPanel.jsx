import React, { useState } from 'react';
import CodeEditor from '../Interview/CodeEditorPanel';

const CodeEditorPanel = ({ languages, questions }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [language, setLanguage] = useState(languages[0] || 'javascript');
  const [code, setCode] = useState('');

  const question = questions[selectedQuestion]?.question;

  return (
    <div className="h-full flex flex-col">
      {/* Question Selector */}
      {questions.length > 1 && (
        <div className="p-4 border-b border-gray-700">
          <select
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(parseInt(e.target.value))}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-2"
          >
            {questions.map((q, idx) => (
              <option key={idx} value={idx}>
                Question {idx + 1}: {q.question?.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          question={question}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          visible={true}
          onClose={() => {}}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;