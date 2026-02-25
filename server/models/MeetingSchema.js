import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate is required'],
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    scheduledDate: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Time must be in HH:MM format',
      ],
    },
    endTime: String,
    duration: {
      type: Number,
      default: 60,
    },

    // Interview Configuration
    interviewConfig: {
      type: {
        type: String,
        enum: ['technical', 'hr', 'aptitude', 'data-entry', 'mixed'],
        required: true,
        default: 'technical',
      },
      category: {
        type: String,
        required: true,
      },
      subCategory: String,
      jobRole: {
        type: String,
        required: true,
      },
      round: {
        type: String,
        required: true,
      },
      experienceLevel: {
        type: String,
        enum: ['fresher', 'junior', 'mid', 'senior'],
        default: 'fresher',
      },
    },

    // Tools Configuration
    enabledTools: {
      codeEditor: {
        enabled: { type: Boolean, default: false },
        languages: [{ type: String, default: 'javascript' }],
      },
      whiteboard: {
        enabled: { type: Boolean, default: true },
      },
      screenShare: {
        enabled: { type: Boolean, default: false },
      },
      videoCall: {
        enabled: { type: Boolean, default: true },
      },
      chat: {
        enabled: { type: Boolean, default: true },
      },
    },
    chatStats: {
      totalMessages: { type: Number, default: 0 },
      lastMessageAt: Date,
    },

    // Questions
    assignedQuestions: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        order: Number,
        timeAllocated: { type: Number, default: 10 },
        mandatory: { type: Boolean, default: true },
      },
    ],

    // Meeting Room
    roomId: {
      type: String,
      unique: true,
      required: true,
    },
    meetingLink: String,

    // Status
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    attended: {
      type: Boolean,
      default: false,
    },
    actualStartTime: Date,
    actualEndTime: Date,
    // NOTE: All evaluation data is now stored in InterviewAnalysis schema
    // This keeps Meeting schema focused on scheduling only
    notes: String,

    // Activity Logs
    activityLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        activity: String,
        details: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

meetingSchema.index({ candidate: 1, scheduledDate: 1 });
meetingSchema.index({ status: 1 });
// Note: roomId index is automatically created by unique:true

export default mongoose.model('Meeting', meetingSchema);
