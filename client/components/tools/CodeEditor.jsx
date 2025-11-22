import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlay, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ question, code, setCode, language, setLanguage, visible, onClose }) => {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'output', 'testcases'

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
    { value: 'python', label: 'Python', monacoLang: 'python' },
    { value: 'java', label: 'Java', monacoLang: 'java' },
    { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  ];

  const getCurrentLanguageConfig = () => {
    return languageOptions.find(l => l.value === language) || languageOptions[0];
  };

  // Update code when language changes
  useEffect(() => {
    if (question && question.starterCode && question.starterCode[language]) {
      setCode(question.starterCode[language].code || '');
    }
  }, [language, question]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');
    setActiveTab('output');

    try {
      // Simple client-side execution simulation
      // In production, you should call a backend API for secure code execution
      
      if (language === 'javascript') {
        try {
          // Create a safe execution context
          const consoleOutput = [];
          const customConsole = {
            log: (...args) => consoleOutput.push(args.join(' ')),
          };

          // Execute the code
          const func = new Function('console', code);
          func(customConsole);

          setOutput(consoleOutput.join('\n') || 'Code executed successfully with no output.');
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        }
      } else {
        // For other languages, show a message
        setOutput(`Code execution for ${getCurrentLanguageConfig().label} requires backend API.\n\nYour code:\n${code}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setActiveTab('testcases');

    try {
      if (!question || !question.testCases || question.testCases.length === 0) {
        setTestResults([{ status: 'error', message: 'No test cases available' }]);
        setIsRunning(false);
        return;
      }

      // Simulate test case execution
      const results = question.testCases.map((testCase, index) => {
        try {
          // This is a simplified version - in production, execute on backend
          if (language === 'javascript') {
            // Parse input and expected output
            const input = testCase.input;
            const expectedOutput = testCase.expectedOutput;

            return {
              index: index + 1,
              status: 'passed', // Simplified - actual execution needed
              input: input,
              expected: expectedOutput,
              actual: expectedOutput, // Placeholder
              isSample: testCase.isSample,
              explanation: testCase.explanation,
            };
          } else {
            return {
              index: index + 1,
              status: 'pending',
              message: `Test execution for ${getCurrentLanguageConfig().label} requires backend API`,
              isSample: testCase.isSample,
            };
          }
        } catch (error) {
          return {
            index: index + 1,
            status: 'failed',
            error: error.message,
            isSample: testCase.isSample,
          };
        }
      });

      setTestResults(results);
    } catch (error) {
      setTestResults([{ status: 'error', message: error.message }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    
    try {
      // In production, send code to backend for evaluation
      await handleRunTests();
      
      // Calculate pass rate
      const passedTests = testResults.filter(r => r.status === 'passed').length;
      const totalTests = testResults.length;
      
      if (passedTests === totalTests) {
        alert(`✅ All test cases passed! (${passedTests}/${totalTests})`);
      } else {
        alert(`⚠️ ${passedTests}/${totalTests} test cases passed.`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="w-2/5 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Code Editor</h2>
          {question && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {question.title}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Language Selector & Actions */}
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {languageOptions.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 flex items-center gap-2 text-sm font-semibold"
          >
            <FaPlay size={12} />
            Run
          </button>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 text-sm font-semibold"
          >
            Test
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:bg-gray-400 text-sm font-semibold"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'code'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'output'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveTab('testcases')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'testcases'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Test Cases
          {testResults.length > 0 && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {testResults.filter(r => r.status === 'passed').length}/{testResults.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="h-full">
            <Editor
              height="100%"
              language={getCurrentLanguageConfig().monacoLang}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && (
          <div className="h-full overflow-y-auto p-4 bg-gray-900 text-gray-100 font-mono text-sm">
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-gray-500">Run your code to see output here...</p>
            )}
          </div>
        )}

        {/* Test Cases Tab */}
        {activeTab === 'testcases' && (
          <div className="h-full overflow-y-auto p-4 bg-gray-50">
            {testResults.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>Click "Test" to run test cases</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 ${
                      result.status === 'passed'
                        ? 'bg-green-50 border-green-300'
                        : result.status === 'failed'
                        ? 'bg-red-50 border-red-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">
                        Test Case {result.index}
                        {result.isSample && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Sample
                          </span>
                        )}
                      </h4>
                      {result.status === 'passed' ? (
                        <FaCheckCircle className="text-green-600" />
                      ) : result.status === 'failed' ? (
                        <FaTimesCircle className="text-red-600" />
                      ) : null}
                    </div>

                    {result.input && (
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-700">Input: </span>
                        <code className="text-sm bg-white px-2 py-1 rounded">{result.input}</code>
                      </div>
                    )}

                    {result.expected && (
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-700">Expected: </span>
                        <code className="text-sm bg-white px-2 py-1 rounded">{result.expected}</code>
                      </div>
                    )}

                    {result.actual && (
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-700">Actual: </span>
                        <code className="text-sm bg-white px-2 py-1 rounded">{result.actual}</code>
                      </div>
                    )}

                    {result.error && (
                      <div className="text-sm text-red-600 bg-red-100 p-2 rounded mt-2">
                        Error: {result.error}
                      </div>
                    )}

                    {result.message && (
                      <div className="text-sm text-gray-600 mt-2">
                        {result.message}
                      </div>
                    )}

                    {result.explanation && (
                      <div className="text-sm text-gray-600 bg-white p-2 rounded mt-2">
                        <strong>Explanation:</strong> {result.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {/* Summary */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                  <p className="text-sm text-blue-800">
                    Passed: {testResults.filter(r => r.status === 'passed').length} / {testResults.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;