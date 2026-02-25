import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/response.js';
import { ApiError } from '../utils/response.js';
import InterviewAnalysis from '../models/InterviewAnalysisSchema.js';
import Submission from '../models/SubmissionSchema.js';
import Meeting from '../models/MeetingSchema.js';
import mongoose from 'mongoose';

export const getInterviewAnalysis = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;

  // Check if meeting exists - handle both ObjectId and roomId
  let meeting;
  if (mongoose.Types.ObjectId.isValid(meetingId)) {
    meeting = await Meeting.findById(meetingId)
      .populate('candidate', 'name email phone')
      .populate('interviewer', 'name email');
  }

  // If not found by _id, try finding by roomId
  if (!meeting) {
    meeting = await Meeting.findOne({ roomId: meetingId })
      .populate('candidate', 'name email phone')
      .populate('interviewer', 'name email');
  }

  if (!meeting) {
    throw new ApiError(404, 'Meeting not found');
  }

  // Use the actual meeting ObjectId for InterviewAnalysis queries
  const actualMeetingId = meeting._id;

  // Get or create interview result
  let result = await InterviewAnalysis.findOne({ meeting: actualMeetingId })
    .populate(
      'questionResults.question',
      'title questionNumber difficulty category'
    )
    .populate('questionResults.latestSubmission')
    .populate('evaluatedBy', 'name email')
    .populate('finalizedBy', 'name email');

  if (!result) {
    result = await InterviewAnalysis.create({
      meeting: actualMeetingId,
      candidate: meeting.candidate._id,
      interviewer: meeting.interviewer?._id,
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        result,
        meeting: {
          id: meeting._id,
          candidate: meeting.candidate,
          interviewer: meeting.interviewer,
          scheduledDate: meeting.scheduledDate,
          status: meeting.status,
        },
      },
      'Interview result fetched successfully'
    )
  );
});

export const updateEvaluation = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const {
    technicalScore,
    problemSolvingScore,
    codeQualityScore,
    dataStructuresScore,
    algorithmsScore,
    communicationScore,
    attitudeScore,
  } = req.body;

  const result = await InterviewAnalysis.findById(resultId);

  if (!result) {
    throw new ApiError(404, 'Interview result not found');
  }

  // Update evaluation scores
  result.overallEvaluation = {
    ...result.overallEvaluation,
    technicalScore,
    problemSolvingScore,
    codeQualityScore,
    dataStructuresScore,
    algorithmsScore,
    communicationScore,
    attitudeScore,
  };

  result.isEvaluated = true;
  result.evaluatedAt = new Date();
  result.evaluatedBy = req.user.id;

  await result.save();

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Evaluation updated successfully'));
});

export const updateFinalResult = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { result: finalResult, resultReason, attended } = req.body;

  const validResults = [
    'pending',
    'pass',
    'fail',
    'on_hold',
    'disqualified',
    'cheating_detected',
    'no_show',
  ];

  if (!validResults.includes(finalResult)) {
    throw new ApiError(
      400,
      `Invalid result. Must be one of: ${validResults.join(', ')}`
    );
  }

  const interviewResult = await InterviewAnalysis.findById(resultId);

  if (!interviewResult) {
    throw new ApiError(404, 'Interview result not found');
  }

  interviewResult.result = finalResult;
  interviewResult.resultReason = resultReason;
  if (attended !== undefined) {
    interviewResult.attended = attended;
  }
  interviewResult.isFinalized = true;
  interviewResult.finalizedAt = new Date();
  interviewResult.finalizedBy = req.user.id;

  await interviewResult.save();

  // Update the meeting status only (evaluation is now in InterviewAnalysis)
  await Meeting.findByIdAndUpdate(interviewResult.meeting, {
    status: 'completed',
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, interviewResult, 'Final result updated successfully')
    );
});

export const addFeedback = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const {
    strengths,
    weaknesses,
    improvements,
    overallComment,
    recommendation,
    hiringDecision,
  } = req.body;

  const result = await InterviewAnalysis.findById(resultId);

  if (!result) {
    throw new ApiError(404, 'Interview result not found');
  }

  result.feedback = {
    strengths: strengths || result.feedback?.strengths || [],
    weaknesses: weaknesses || result.feedback?.weaknesses || [],
    improvements: improvements || result.feedback?.improvements || [],
    overallComment: overallComment || result.feedback?.overallComment,
    recommendation: recommendation || result.feedback?.recommendation,
    hiringDecision: hiringDecision || result.feedback?.hiringDecision,
  };

  await result.save();

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Feedback added successfully'));
});

export const updateQuestionRating = asyncHandler(async (req, res) => {
  const { resultId, questionId } = req.params;
  const {
    interviewerRating,
    interviewerComment,
    codeQualityRating,
    approachRating,
  } = req.body;

  const result = await InterviewAnalysis.findById(resultId);

  if (!result) {
    throw new ApiError(404, 'Interview result not found');
  }

  const questionIndex = result.questionResults.findIndex(
    (qr) => qr.question.toString() === questionId
  );

  if (questionIndex === -1) {
    throw new ApiError(404, 'Question not found in interview results');
  }

  result.questionResults[questionIndex].interviewerRating = interviewerRating;
  result.questionResults[questionIndex].interviewerComment = interviewerComment;
  result.questionResults[questionIndex].codeQualityRating = codeQualityRating;
  result.questionResults[questionIndex].approachRating = approachRating;

  await result.save();

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Question rating updated successfully'));
});

export const updateIntegrityFlags = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const {
    tabSwitchCount,
    copyPasteDetected,
    suspiciousActivity,
    plagiarismScore,
    notes,
  } = req.body;

  const result = await InterviewAnalysis.findById(resultId);

  if (!result) {
    throw new ApiError(404, 'Interview result not found');
  }

  result.integrityFlags = {
    tabSwitchCount:
      tabSwitchCount ?? result.integrityFlags?.tabSwitchCount ?? 0,
    copyPasteDetected:
      copyPasteDetected ?? result.integrityFlags?.copyPasteDetected ?? false,
    suspiciousActivity:
      suspiciousActivity ?? result.integrityFlags?.suspiciousActivity ?? false,
    plagiarismScore: plagiarismScore ?? result.integrityFlags?.plagiarismScore,
    notes: notes ?? result.integrityFlags?.notes,
  };

  await result.save();

  res
    .status(200)
    .json(new ApiResponse(200, result, 'Integrity flags updated successfully'));
});

export const getCandidateResults = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;

  const results = await InterviewAnalysis.find({ candidate: candidateId })
    .populate('meeting', 'scheduledDate status interviewConfig')
    .populate('interviewer', 'name email')
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, results, 'Candidate results fetched successfully')
    );
});

export const getAllResults = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    result: resultFilter,
    isEvaluated,
    isFinalized,
    startDate,
    endDate,
  } = req.query;

  const query = {};

  if (resultFilter) query.result = resultFilter;
  if (isEvaluated !== undefined) query.isEvaluated = isEvaluated === 'true';
  if (isFinalized !== undefined) query.isFinalized = isFinalized === 'true';
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [results, total] = await Promise.all([
    InterviewAnalysis.find(query)
      .populate('candidate', 'name email phone position photo')
      .populate('meeting', 'scheduledDate status interviewConfig roomId')
      .populate('interviewer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    InterviewAnalysis.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
      'Interview results fetched successfully'
    )
  );
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalResults, resultsByStatus, avgScores, recentResults] =
    await Promise.all([
      InterviewAnalysis.countDocuments(),
      InterviewAnalysis.aggregate([
        { $group: { _id: '$result', count: { $sum: 1 } } },
      ]),
      InterviewAnalysis.aggregate([
        { $match: { 'codingScore.percentage': { $gt: 0 } } },
        {
          $group: {
            _id: null,
            avgCodingScore: { $avg: '$codingScore.percentage' },
            avgOverallScore: { $avg: '$overallEvaluation.overallScore' },
          },
        },
      ]),
      InterviewAnalysis.find()
        .populate('candidate', 'name')
        .populate('meeting', 'scheduledDate')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('result codingScore.percentage candidate meeting createdAt'),
    ]);

  // Format results by status
  const statusCounts = {
    pending: 0,
    pass: 0,
    fail: 0,
    on_hold: 0,
    disqualified: 0,
    cheating_detected: 0,
    no_show: 0,
  };
  resultsByStatus.forEach((r) => {
    if (r._id) statusCounts[r._id] = r.count;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        total: totalResults,
        byStatus: statusCounts,
        averages: avgScores[0] || { avgCodingScore: 0, avgOverallScore: 0 },
        recentResults,
      },
      'Dashboard stats fetched successfully'
    )
  );
});

export default {
  getInterviewAnalysis,
  updateEvaluation,
  updateFinalResult,
  addFeedback,
  updateQuestionRating,
  updateIntegrityFlags,
  getCandidateResults,
  getAllResults,
  getDashboardStats,
};
