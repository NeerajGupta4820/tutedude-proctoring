// hooks/useCodeExecution.js
import { useState, useCallback } from 'react';
import { codeApi } from '../services/api';
import { toast } from 'sonner';

export const useCodeExecution = ({
  questionId,
  meetingId,
  candidateId,
  onRunComplete,
  onSubmitComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [error, setError] = useState(null);

  const runCode = useCallback(
    async (code, language) => {
      if (!code || !code.trim()) {
        toast.error('Please write some code first');
        return;
      }

      setIsRunning(true);
      setError(null);
      setOutput('⏳ Running your code...\n');

      try {
        const response = await codeApi.run({
          code,
          language,
          questionId,
        });

        if (response.success) {
          const { data } = response;

          // Format output
          let outputText = '';

          data.testResults.forEach((result) => {
            const icon = result.passed ? '✓' : '✗';
            const status = result.passed ? 'Passed' : 'Failed';
            outputText += `${icon} Test Case ${result.testCase}: ${status}\n`;

            if (!result.passed) {
              outputText += `  Input: ${result.input}\n`;
              outputText += `  Expected: ${result.expectedOutput}\n`;
              outputText += `  Got: ${result.actualOutput}\n`;
            }

            if (result.error) {
              outputText += `  Error: ${result.error}\n`;
            }

            if (result.runtime) {
              outputText += `  Runtime: ${result.runtime}\n`;
            }
          });

          outputText += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
          outputText += `📊 Summary: ${data.summary.passed}/${data.summary.totalTests} test cases passed\n`;
          outputText += `⏱️ Runtime: ${data.summary.runtime}\n`;
          outputText += `💾 Memory: ${data.summary.memory}\n`;

          setOutput(outputText);
          setTestResults(data);

          if (data.summary.passed === data.summary.totalTests) {
            toast.success('All sample test cases passed!');
          } else {
            toast.error(`${data.summary.failed} test case(s) failed`);
          }

          onRunComplete?.(data);
        } else {
          throw new Error(response.message || 'Execution failed');
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Execution failed';
        setError(errorMessage);
        setOutput(`❌ Error: ${errorMessage}`);
        toast.error(errorMessage);
      } finally {
        setIsRunning(false);
      }
    },
    [questionId, onRunComplete]
  );

  const submitCode = useCallback(
    async (code, language) => {
      if (!code || !code.trim()) {
        toast.error('Please write some code first');
        return;
      }

      if (!meetingId || !candidateId) {
        toast.error('Meeting information is missing');
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setOutput('📤 Submitting your solution...\n');

      try {
        const response = await codeApi.submit({
          code,
          language,
          questionId,
          meetingId,
          candidateId,
        });

        if (response.success) {
          const { data } = response;

          // Format output
          let outputText = '';

          if (data.status === 'accepted') {
            outputText += '🎉 Accepted!\n\n';
          } else {
            outputText += `❌ ${data.statusDisplay}\n\n`;
          }

          outputText += `📊 Test Cases: ${data.testResults.passed}/${data.testResults.total} passed\n`;

          if (data.testResults.details && data.testResults.details.length > 0) {
            outputText += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            outputText += 'Visible Test Cases:\n';

            data.testResults.details.forEach((result) => {
              const icon = result.passed ? '✓' : '✗';
              outputText += `${icon} Test ${result.testCase}: ${result.passed ? 'Passed' : 'Failed'}\n`;
            });
          }

          outputText += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
          outputText += `⏱️ Runtime: ${data.performance.runtime}`;

          if (data.performance.runtimePercentile) {
            outputText += ` (Beats ${data.performance.runtimePercentile}%)`;
          }

          outputText += `\n💾 Memory: ${data.performance.memory}`;

          if (data.performance.memoryPercentile) {
            outputText += ` (Beats ${data.performance.memoryPercentile}%)`;
          }

          outputText += `\n\n📝 Score: ${data.score.percentage}%`;
          outputText += `\n🔢 Attempt: #${data.attemptNumber}`;

          setOutput(outputText);
          setTestResults(data);
          setLastSubmission(data);

          if (data.status === 'accepted') {
            toast.success('🎉 All test cases passed!');
          } else {
            toast.error(response.message);
          }

          onSubmitComplete?.(data);
        } else {
          throw new Error(response.message || 'Submission failed');
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Submission failed';
        setError(errorMessage);
        setOutput(`❌ Error: ${errorMessage}`);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [questionId, meetingId, candidateId, onSubmitComplete]
  );

  const clearOutput = useCallback(() => {
    setOutput('');
    setTestResults(null);
    setError(null);
  }, []);

  return {
    // State
    isRunning,
    isSubmitting,
    isLoading: isRunning || isSubmitting,
    output,
    testResults,
    lastSubmission,
    error,

    // Actions
    runCode,
    submitCode,
    clearOutput,

    // Setters for external updates (socket sync)
    setOutput,
    setTestResults,
  };
};

export default useCodeExecution;
