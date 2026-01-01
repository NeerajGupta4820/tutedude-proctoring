import Meeting from '../models/MeetingSchema.js';
import Candidate from '../models/CandidateSchema.js';
import User from '../models/UserSchema.js';
import Question from '../models/QuestionSchema.js';
import { ApiError } from '../utils/response.js';
import { MEETING_STATUS } from '../constants/meeting.constants.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

class MeetingService {
  generateRoomId() {
    return `meeting-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  generateMeetingLink(roomId) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/interview?meetingId=${roomId}`;
  }

  async validateCandidate(candidateId) {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      throw new ApiError(404, 'Candidate not found');
    }
    return candidate;
  }

  async validateInterviewer(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Interviewer not found');
    }
    return user;
  }

  async validateQuestions(questionIds) {
    if (!questionIds || questionIds.length === 0) return [];

    const ids = questionIds.map((q) => q.question || q);
    const questions = await Question.find({
      _id: { $in: ids },
      isActive: true,
    });

    if (questions.length !== ids.length) {
      throw new ApiError(400, 'One or more questions are invalid or inactive');
    }

    return questions;
  }

  async createMeeting(meetingData, currentUserId) {
    const {
      candidateId,
      interviewerId,
      scheduledDate,
      startTime,
      duration = 60,
      interviewConfig,
      enabledTools,
      assignedQuestions,
      notes,
    } = meetingData;

    await this.validateCandidate(candidateId);
    if (interviewerId) await this.validateInterviewer(interviewerId);
    if (assignedQuestions && assignedQuestions.length > 0) {
      await this.validateQuestions(assignedQuestions);
    }

    const roomId = this.generateRoomId();
    const meetingLink = this.generateMeetingLink(roomId);

    const meeting = await Meeting.create({
      candidate: candidateId,
      interviewer: interviewerId || currentUserId,
      scheduledDate,
      startTime,
      duration,
      interviewConfig,
      enabledTools,
      assignedQuestions: assignedQuestions?.map((q, index) => ({
        question: q.question || q,
        order: q.order || index + 1,
        timeAllocated: q.timeAllocated || 10,
        mandatory: q.mandatory !== undefined ? q.mandatory : true,
      })),
      roomId,
      meetingLink,
      status: 'scheduled',
      notes,
    });

    return this.getMeetingById(meeting._id);
  }

  // ✅ UPDATED: Now handles both ObjectId and roomId
  async getMeetingById(meetingId) {
    let meeting;

    // Check if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(meetingId)) {
      meeting = await Meeting.findById(meetingId)
        .populate('candidate', 'name email phone position')
        .populate('interviewer', 'name email role avatar')
        .populate({
          path: 'assignedQuestions.question',
          select:
            'title description questionType category difficulty format points timeLimit codingDetails',
        })
        .lean();
    }

    // If not found by _id, try finding by roomId
    if (!meeting) {
      meeting = await Meeting.findOne({ roomId: meetingId })
        .populate('candidate', 'name email phone position')
        .populate('interviewer', 'name email role avatar')
        .populate({
          path: 'assignedQuestions.question',
          select:
            'title description questionType category difficulty format points timeLimit codingDetails',
        })
        .lean();
    }

    if (!meeting) {
      throw new ApiError(404, 'Meeting not found');
    }

    return meeting;
  }

  async getAllMeetings(options = {}) {
    const {
      page = 1,
      limit = 100,
      sort = '-scheduledDate',
      status,
      candidateId,
    } = options;

    const query = {};
    if (status) query.status = status;
    if (candidateId) query.candidate = candidateId;

    const skip = (page - 1) * limit;
    const [meetings, total] = await Promise.all([
      Meeting.find(query)
        .populate('candidate', 'name email position')
        .populate('interviewer', 'name email')
        .populate('assignedQuestions.question', 'title category difficulty')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Meeting.countDocuments(query),
    ]);

    return {
      meetings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  // ✅ UPDATED: Now handles both ObjectId and roomId
  async updateMeeting(meetingId, updateData) {
    let meeting;

    // Check if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(meetingId)) {
      meeting = await Meeting.findByIdAndUpdate(meetingId, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('candidate', 'name email')
        .populate('assignedQuestions.question');
    }

    // If not found by _id, try finding and updating by roomId
    if (!meeting) {
      meeting = await Meeting.findOneAndUpdate(
        { roomId: meetingId },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('candidate', 'name email')
        .populate('assignedQuestions.question');
    }

    if (!meeting) {
      throw new ApiError(404, 'Meeting not found');
    }

    return meeting;
  }

  async getNextMeeting(candidateId) {
    const meeting = await Meeting.findOne({
      candidate: candidateId,
      status: 'scheduled',
      scheduledDate: { $gte: new Date() },
    })
      .sort({ scheduledDate: 1, startTime: 1 })
      .populate('candidate', 'name email')
      .populate('interviewer', 'name email')
      .populate('assignedQuestions.question')
      .lean();

    if (!meeting) {
      throw new ApiError(404, 'No upcoming meetings found');
    }

    return meeting;
  }
}

export default new MeetingService();
