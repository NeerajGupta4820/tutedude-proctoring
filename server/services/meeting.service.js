import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import { ApiError } from '../utils/response.js';
import { MEETING_STATUS } from '../constants/meeting.constants.js';
import crypto from 'crypto';

class MeetingService {
  generateRoomId() {
    return `meeting-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  generateMeetingLink(roomId) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/interview?meetingId=${roomId}`;
  }

  async validateUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async validateQuestions(questionIds) {
    if (!questionIds || questionIds.length === 0) return [];
    
    const ids = questionIds.map(q => q.question || q);
    const questions = await Question.find({ _id: { $in: ids }, isActive: true });
    
    if (questions.length !== ids.length) {
      throw new ApiError(400, 'One or more questions are invalid or inactive');
    }
    
    return questions;
  }

  async createMeeting(meetingData) {
    const {
      userId,
      interviewerId,
      scheduledDate,
      startTime,
      duration = 60,
      interviewConfig,
      enabledTools,
      assignedQuestions,
      notes,
    } = meetingData;

    await this.validateUser(userId);
    if (interviewerId) await this.validateUser(interviewerId);
    if (assignedQuestions && assignedQuestions.length > 0) {
      await this.validateQuestions(assignedQuestions);
    }

    const roomId = this.generateRoomId();
    const meetingLink = this.generateMeetingLink(roomId);

    const meeting = await Meeting.create({
      user: userId,
      interviewer: interviewerId,
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

  async getMeetingById(meetingId) {
    const meeting = await Meeting.findById(meetingId)
      .populate('user', 'name email role avatar')
      .populate('interviewer', 'name email role avatar')
      .populate({
        path: 'assignedQuestions.question',
        select: 'title description questionType category difficulty format points timeLimit codingDetails',
      })
      .lean();

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
      userId,
    } = options;

    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const skip = (page - 1) * limit;
    const [meetings, total] = await Promise.all([
      Meeting.find(query)
        .populate('user', 'name email role')
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

  async updateMeeting(meetingId, updateData) {
    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('assignedQuestions.question');

    if (!meeting) {
      throw new ApiError(404, 'Meeting not found');
    }

    return meeting;
  }

  async getNextMeeting(userId) {
    const meeting = await Meeting.findOne({
      user: userId,
      status: 'scheduled',
      scheduledDate: { $gte: new Date() },
    })
      .sort({ scheduledDate: 1, startTime: 1 })
      .populate('user', 'name email')
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