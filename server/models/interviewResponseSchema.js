import mongoose from 'mongoose';

const interviewResponseSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    
    // Response based on question type
    response: {
      // For MCQ
      selectedOption: String,
      
      // For Coding
      code: String,
      language: String,
      executionResults: [{
        testCase: Number,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        executionTime: Number,
        memoryUsed: Number,
      }],
      
      // For Descriptive
      textAnswer: String,
      
      // For Practical/Live coding
      codeSnapshots: [{
        timestamp: Date,
        code: String,
      }],
    },
    
    // Timing
    startedAt: Date,
    submittedAt: Date,
    timeTaken: Number, // seconds
    
    // Evaluation
    isCorrect: Boolean,
    scoreObtained: Number,
    maxScore: Number,
    
    // Interviewer feedback on this answer
    interviewerNotes: String,
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    
    // Flags
    isSkipped: { type: Boolean, default: false },
    needsReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

interviewResponseSchema.index({ meeting: 1, question: 1 });
interviewResponseSchema.index({ user: 1 });

export default mongoose.model('InterviewResponse', interviewResponseSchema);