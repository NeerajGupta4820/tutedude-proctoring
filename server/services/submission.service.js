import Submission from '../models/SubmissionSchema.js';
import InterviewResult from '../models/InterviewResultSchema.js';
import Question from '../models/QuestionSchema.js';
import { ApiError } from '../utils/response.js';

class SubmissionService {
  async createSubmission(data) {
    try {
      const {
        questionId,
        candidateId,
        meetingId,
        code,
        language,
        submissionType,
        testResults,
        summary,
        status,
      } = data;

      // Get question details
      const question = await Question.findById(questionId);
      if (!question) {
        throw new ApiError(404, 'Question not found');
      }

      // For submit type, mark previous submissions as not latest
      if (submissionType === 'submit') {
        await Submission.markPreviousAsOld(questionId, candidateId, meetingId);
      }

      // Get attempt number
      const previousAttempts = await Submission.countDocuments({
        question: questionId,
        candidate: candidateId,
        meeting: meetingId,
        submissionType: 'submit',
      });

      // Create submission
      const submission = await Submission.create({
        question: questionId,
        candidate: candidateId,
        meeting: meetingId,
        code,
        language,
        submissionType,
        status,
        testResults: testResults.map((result, index) => ({
          testCaseIndex: index + 1,
          input: result.input,
          expectedOutput: result.expectedOutput,
          actualOutput: result.actualOutput,
          passed: result.passed,
          isHidden: result.isHidden,
          runtime: result.runtime,
          memory: result.memory,
          error: result.error,
          status: result.status,
        })),
        summary: {
          totalTestCases: summary.totalTests,
          passedTestCases: summary.passed,
          failedTestCases: summary.failed,
          avgRuntime: summary.avgRuntime,
          avgMemory: summary.avgMemory,
        },
        score: {
          obtained: Math.round((summary.passed / summary.totalTests) * 100),
          maximum: 100,
          percentage: summary.passPercentage,
        },
        attemptNumber: previousAttempts + 1,
        startedAt: data.startedAt || new Date(),
        completedAt: new Date(),
      });

      // Update question statistics
      await this.updateQuestionStats(questionId, status === 'accepted');

      // For submit type, update interview result
      if (submissionType === 'submit') {
        await this.updateInterviewResult({
          meetingId,
          candidateId,
          questionId,
          submission,
          question,
        });
      }

      return submission;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to create submission: ${error.message}`);
    }
  }

  async updateQuestionStats(questionId, accepted) {
    try {
      const question = await Question.findById(questionId);
      if (question) {
        question.totalSubmissions += 1;
        if (accepted) {
          question.totalAccepted += 1;
        }
        question.updateAcceptanceRate();
        await question.save();
      }
    } catch (error) {
      console.error('Failed to update question stats:', error);
    }
  }

  async updateInterviewResult({
    meetingId,
    candidateId,
    questionId,
    submission,
    question,
  }) {
    try {
      // Get or create interview result
      let interviewResult = await InterviewResult.findOne({
        meeting: meetingId,
      });

      if (!interviewResult) {
        interviewResult = await InterviewResult.create({
          meeting: meetingId,
          candidate: candidateId,
        });
      }

      // Determine question status
      let questionStatus = 'attempted';
      if (submission.status === 'accepted') {
        questionStatus = 'solved';
      } else if (submission.score.percentage >= 50) {
        questionStatus = 'partially_solved';
      } else if (submission.status === 'time_limit_exceeded') {
        questionStatus = 'time_limit_exceeded';
      } else if (submission.status === 'wrong_answer') {
        questionStatus = 'wrong_answer';
      }

      // Update question result
      await InterviewResult.updateQuestionResult(meetingId, questionId, {
        questionNumber: question.questionNumber,
        title: question.title,
        difficulty: question.difficulty,
        submissionId: submission._id,
        attemptNumber: submission.attemptNumber,
        status: questionStatus,
        passedTestCases: submission.summary.passedTestCases,
        totalTestCases: submission.summary.totalTestCases,
        score: submission.score.percentage,
        runtime: submission.summary.avgRuntime,
        memory: submission.summary.avgMemory,
        language: submission.language,
      });
    } catch (error) {
      console.error('Failed to update interview result:', error);
    }
  }

  async getSubmissionById(submissionId) {
    const submission = await Submission.findById(submissionId)
      .populate('question', 'title questionNumber difficulty')
      .populate('candidate', 'name email');

    if (!submission) {
      throw new ApiError(404, 'Submission not found');
    }

    return submission;
  }

  async getMeetingSubmissions(meetingId) {
    const submissions = await Submission.find({
      meeting: meetingId,
      submissionType: 'submit',
    })
      .populate('question', 'title questionNumber difficulty')
      .sort({ createdAt: -1 });

    return submissions;
  }

  async getQuestionSubmissions(meetingId, questionId) {
    const submissions = await Submission.find({
      meeting: meetingId,
      question: questionId,
      submissionType: 'submit',
    }).sort({ createdAt: -1 });

    return submissions;
  }

  async getLatestSubmission(meetingId, questionId, candidateId) {
    const submission = await Submission.getLatestSubmission(
      questionId,
      candidateId,
      meetingId
    );

    return submission;
  }


  async addInterviewerFeedback(submissionId, feedback, reviewerId) {
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      throw new ApiError(404, 'Submission not found');
    }

    submission.interviewerFeedback = {
      rating: feedback.rating,
      comment: feedback.comment,
      codeQuality: feedback.codeQuality,
      efficiency: feedback.efficiency,
      problemSolving: feedback.problemSolving,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    };

    await submission.save();

    return submission;
  }

  async getCandidateStats(candidateId, meetingId = null) {
    const query = {
      candidate: candidateId,
      submissionType: 'submit',
    };

    if (meetingId) {
      query.meeting = meetingId;
    }

    const submissions = await Submission.find(query);

    const stats = {
      totalSubmissions: submissions.length,
      accepted: submissions.filter((s) => s.status === 'accepted').length,
      wrongAnswer: submissions.filter((s) => s.status === 'wrong_answer')
        .length,
      tle: submissions.filter((s) => s.status === 'time_limit_exceeded').length,
      runtimeError: submissions.filter((s) => s.status === 'runtime_error')
        .length,
      compilationError: submissions.filter(
        (s) => s.status === 'compilation_error'
      ).length,
      acceptanceRate: 0,
      avgScore: 0,
    };

    if (stats.totalSubmissions > 0) {
      stats.acceptanceRate = Math.round(
        (stats.accepted / stats.totalSubmissions) * 100
      );
      stats.avgScore = Math.round(
        submissions.reduce((sum, s) => sum + s.score.percentage, 0) /
          stats.totalSubmissions
      );
    }

    return stats;
  }
}

export default new SubmissionService();
