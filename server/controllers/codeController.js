import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/response.js';
import codeService from '../services/code.service.js';
import submissionService from '../services/submission.service.js';
import Question from '../models/QuestionSchema.js';
import { ApiError } from '../utils/response.js';

export const runCode = asyncHandler(async (req, res) => {
  const { code, language, questionId } = req.body;

  // Validation
  if (!code || !language || !questionId) {
    throw new ApiError(400, 'Code, language, and questionId are required');
  }

  // Validate code
  const validation = codeService.validateCode(code, language);
  if (!validation.valid) {
    throw new ApiError(400, validation.error);
  }

  // Check if question exists
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  // Execute code against sample test cases
  const result = await codeService.runCode({
    code,
    language,
    questionId,
  });

  // Format response
  const response = {
    status: result.status,
    language,
    questionId,
    testResults: result.testResults.map((tr) => ({
      testCase: tr.testCaseIndex,
      passed: tr.passed,
      input: tr.input,
      expectedOutput: tr.expectedOutput,
      actualOutput: tr.actualOutput,
      runtime: tr.runtime ? `${tr.runtime}ms` : null,
      memory: tr.memory ? `${(tr.memory / 1024).toFixed(2)} MB` : null,
      error: tr.error,
      status: tr.status,
    })),
    summary: {
      totalTests: result.summary.totalTests,
      passed: result.summary.passed,
      failed: result.summary.failed,
      passPercentage: result.summary.passPercentage,
      runtime: result.summary.runtimeDisplay,
      memory: result.summary.memoryDisplay,
    },
    executionTime: `${result.executionTime}ms`,
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, 'Code executed successfully'));
});

export const submitCode = asyncHandler(async (req, res) => {
  const { code, language, questionId, meetingId } = req.body;
  const candidateId = req.user?.candidateId || req.body.candidateId;

  // Validation
  if (!code || !language || !questionId) {
    throw new ApiError(400, 'Code, language, and questionId are required');
  }

  if (!meetingId) {
    throw new ApiError(400, 'Meeting ID is required for submission');
  }

  if (!candidateId) {
    throw new ApiError(400, 'Candidate ID is required for submission');
  }

  // Validate code
  const validation = codeService.validateCode(code, language);
  if (!validation.valid) {
    throw new ApiError(400, validation.error);
  }

  // Check if question exists
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  // Execute code against all test cases
  const executionResult = await codeService.submitCode({
    code,
    language,
    questionId,
  });

  // Save submission to database
  const submission = await submissionService.createSubmission({
    questionId,
    candidateId,
    meetingId,
    code,
    language,
    submissionType: 'submit',
    testResults: executionResult.testResults,
    summary: executionResult.summary,
    status: executionResult.status,
    startedAt: req.body.startedAt || new Date(),
  });

  // Format response
  const response = {
    submissionId: submission._id,
    status: executionResult.status,
    statusDisplay: getStatusDisplay(executionResult.status),
    language,
    questionId,
    question: {
      title: question.title,
      questionNumber: question.questionNumber,
      difficulty: question.difficulty,
    },
    testResults: {
      total: executionResult.summary.totalTests,
      passed: executionResult.summary.passed,
      failed: executionResult.summary.failed,
      passPercentage: executionResult.summary.passPercentage,
      // Only show detailed results for visible test cases
      details: executionResult.testResults
        .filter((tr) => !tr.isHidden)
        .map((tr) => ({
          testCase: tr.testCaseIndex,
          passed: tr.passed,
          input: tr.input,
          expectedOutput: tr.expectedOutput,
          actualOutput: tr.actualOutput,
          runtime: tr.runtime ? `${tr.runtime}ms` : null,
          status: tr.status,
        })),
    },
    performance: {
      runtime: executionResult.summary.runtimeDisplay,
      memory: executionResult.summary.memoryDisplay,
      runtimePercentile: calculatePercentile(
        executionResult.summary.avgRuntime,
        'runtime'
      ),
      memoryPercentile: calculatePercentile(
        executionResult.summary.avgMemory,
        'memory'
      ),
    },
    score: {
      obtained: submission.score.obtained,
      maximum: submission.score.maximum,
      percentage: submission.score.percentage,
    },
    attemptNumber: submission.attemptNumber,
    submittedAt: submission.createdAt,
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        response,
        getSubmissionMessage(executionResult.status)
      )
    );
});

export const getSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  const submission = await submissionService.getSubmissionById(submissionId);

  res
    .status(200)
    .json(new ApiResponse(200, submission, 'Submission fetched successfully'));
});

export const getMeetingSubmissions = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;

  const submissions = await submissionService.getMeetingSubmissions(meetingId);

  // Group by question
  const groupedByQuestion = {};
  submissions.forEach((sub) => {
    const qId = sub.question._id.toString();
    if (!groupedByQuestion[qId]) {
      groupedByQuestion[qId] = {
        question: sub.question,
        submissions: [],
        latestStatus: null,
        totalAttempts: 0,
        bestScore: 0,
      };
    }
    groupedByQuestion[qId].submissions.push(sub);
    groupedByQuestion[qId].totalAttempts++;
    if (sub.isLatestSubmission) {
      groupedByQuestion[qId].latestStatus = sub.status;
    }
    if (sub.score.percentage > groupedByQuestion[qId].bestScore) {
      groupedByQuestion[qId].bestScore = sub.score.percentage;
    }
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        submissions,
        groupedByQuestion: Object.values(groupedByQuestion),
        summary: {
          totalSubmissions: submissions.length,
          questionsAttempted: Object.keys(groupedByQuestion).length,
          accepted: submissions.filter((s) => s.status === 'accepted').length,
        },
      },
      'Meeting submissions fetched successfully'
    )
  );
});

export const getQuestionSubmissions = asyncHandler(async (req, res) => {
  const { meetingId, questionId } = req.params;

  const submissions = await submissionService.getQuestionSubmissions(
    meetingId,
    questionId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        submissions,
        totalAttempts: submissions.length,
        latestSubmission: submissions[0] || null,
        bestScore: submissions.length
          ? Math.max(...submissions.map((s) => s.score.percentage))
          : 0,
        isSolved: submissions.some((s) => s.status === 'accepted'),
      },
      'Question submissions fetched successfully'
    )
  );
});

export const addFeedback = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { rating, comment, codeQuality, efficiency, problemSolving } = req.body;
  const reviewerId = req.user.id;

  const submission = await submissionService.addInterviewerFeedback(
    submissionId,
    { rating, comment, codeQuality, efficiency, problemSolving },
    reviewerId
  );

  res
    .status(200)
    .json(new ApiResponse(200, submission, 'Feedback added successfully'));
});

export const getCandidateStats = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;
  const { meetingId } = req.query;

  const stats = await submissionService.getCandidateStats(
    candidateId,
    meetingId
  );

  res
    .status(200)
    .json(new ApiResponse(200, stats, 'Candidate stats fetched successfully'));
});

export const getLatestSubmission = asyncHandler(async (req, res) => {
  const { meetingId, questionId, candidateId } = req.params;

  const submission = await submissionService.getLatestSubmission(
    meetingId,
    questionId,
    candidateId
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        submission,
        submission ? 'Latest submission fetched' : 'No submission found'
      )
    );
});

// ============ Helper Functions ============


function getStatusDisplay(status) {
  const statusMap = {
    accepted: '✅ Accepted',
    wrong_answer: '❌ Wrong Answer',
    time_limit_exceeded: '⏱️ Time Limit Exceeded',
    memory_limit_exceeded: '💾 Memory Limit Exceeded',
    runtime_error: '💥 Runtime Error',
    compilation_error: '🔴 Compilation Error',
    internal_error: '⚠️ Internal Error',
    pending: '⏳ Pending',
    running: '🔄 Running',
  };
  return statusMap[status] || status;
}

function getSubmissionMessage(status) {
  const messageMap = {
    accepted: 'Congratulations! All test cases passed!',
    wrong_answer: 'Some test cases failed. Please check your solution.',
    time_limit_exceeded: 'Your solution exceeded the time limit.',
    memory_limit_exceeded: 'Your solution exceeded the memory limit.',
    runtime_error: 'A runtime error occurred during execution.',
    compilation_error: 'Compilation failed. Please check your syntax.',
    internal_error: 'An internal error occurred. Please try again.',
  };
  return messageMap[status] || 'Submission processed';
}

function calculatePercentile(value, type) {
  // Dummy percentile calculation
  // In production, compare with historical data
  if (type === 'runtime') {
    if (value < 10) return 99;
    if (value < 50) return 90;
    if (value < 100) return 75;
    if (value < 200) return 50;
    return 25;
  }
  if (type === 'memory') {
    if (value < 40000) return 95;
    if (value < 45000) return 80;
    if (value < 50000) return 60;
    return 40;
  }
  return 50;
}

export default {
  runCode,
  submitCode,
  getSubmission,
  getMeetingSubmissions,
  getQuestionSubmissions,
  addFeedback,
  getCandidateStats,
  getLatestSubmission,
};
