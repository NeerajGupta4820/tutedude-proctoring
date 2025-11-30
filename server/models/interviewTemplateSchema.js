import mongoose from 'mongoose';

const interviewTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['technical', 'hr', 'aptitude', 'data-entry', 'mixed'],
      required: true,
    },
    category: String,
    jobRole: String,
    defaultTools: {
      codeEditor: {
        enabled: Boolean,
        languages: [String],
      },
      whiteboard: {
        enabled: Boolean,
      },
      screenShare: {
        enabled: Boolean,
      },
      dsaPlatform: {
        enabled: Boolean,
      },
    },
    questionPool: [{
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
      isRequired: Boolean,
      timeAllocated: Number,
    }],
    defaultDuration: {
      type: Number,
      default: 60,
    },
    evaluationCriteria: {
      technical: { weight: Number },
      communication: { weight: Number },
      problemSolving: { weight: Number },
      attitude: { weight: Number },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('InterviewTemplate', interviewTemplateSchema);