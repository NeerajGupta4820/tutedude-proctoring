import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    // References
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },

    // Code Details
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'typescript'],
      required: true,
    },

    // Submission Type
    submissionType: {
      type: String,
      enum: ['run', 'submit'],
      required: true,
    },

    // Execution Results
    status: {
      type: String,
      enum: [
        'pending',
        'running',
        'accepted',
        'wrong_answer',
        'time_limit_exceeded',
        'memory_limit_exceeded',
        'runtime_error',
        'compilation_error',
        'internal_error',
      ],
      default: 'pending',
    },

    // Test Case Results
    testResults: [
      {
        testCaseIndex: {
          type: Number,
          required: true,
        },
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: {
          type: Boolean,
          default: false,
        },
        isHidden: {
          type: Boolean,
          default: false,
        },
        runtime: Number, // in milliseconds
        memory: Number, // in KB
        error: String,
        status: {
          type: String,
          enum: [
            'passed',
            'failed',
            'time_limit_exceeded',
            'memory_limit_exceeded',
            'runtime_error',
            'compilation_error',
          ],
        },
      },
    ],

    // Summary Stats
    summary: {
      totalTestCases: {
        type: Number,
        default: 0,
      },
      passedTestCases: {
        type: Number,
        default: 0,
      },
      failedTestCases: {
        type: Number,
        default: 0,
      },
      totalRuntime: Number, // in milliseconds
      avgRuntime: Number,
      totalMemory: Number, // in KB
      avgMemory: Number,
      runtimePercentile: Number,
      memoryPercentile: Number,
    },

    // Scoring
    score: {
      obtained: {
        type: Number,
        default: 0,
      },
      maximum: {
        type: Number,
        default: 100,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },

    // Compilation Details
    compilationError: String,
    compileOutput: String,

    // Timing
    startedAt: Date,
    completedAt: Date,
    executionTime: Number, // Total time taken in seconds

    // Judge0 Reference
    judge0Tokens: [String],

    // Interviewer Feedback (for submit type)
    interviewerFeedback: {
      rating: {
        type: Number,
        min: 0,
        max: 10,
      },
      comment: String,
      codeQuality: {
        type: Number,
        min: 0,
        max: 10,
      },
      efficiency: {
        type: Number,
        min: 0,
        max: 10,
      },
      problemSolving: {
        type: Number,
        min: 0,
        max: 10,
      },
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // Flags
    isLatestSubmission: {
      type: Boolean,
      default: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
submissionSchema.index({ question: 1, candidate: 1, meeting: 1 });
submissionSchema.index({ candidate: 1, submissionType: 1 });
submissionSchema.index({ meeting: 1, status: 1 });
submissionSchema.index({ createdAt: -1 });

// Virtual for pass/fail status
submissionSchema.virtual('isPassed').get(function () {
  return this.status === 'accepted';
});

// Pre-save: Calculate summary stats
submissionSchema.pre('save', function (next) {
  if (this.testResults && this.testResults.length > 0) {
    const passed = this.testResults.filter((t) => t.passed).length;
    const total = this.testResults.length;

    this.summary.totalTestCases = total;
    this.summary.passedTestCases = passed;
    this.summary.failedTestCases = total - passed;

    // Calculate runtime stats
    const runtimes = this.testResults
      .filter((t) => t.runtime)
      .map((t) => t.runtime);
    if (runtimes.length > 0) {
      this.summary.totalRuntime = runtimes.reduce((a, b) => a + b, 0);
      this.summary.avgRuntime = Math.round(
        this.summary.totalRuntime / runtimes.length
      );
    }

    // Calculate memory stats
    const memories = this.testResults
      .filter((t) => t.memory)
      .map((t) => t.memory);
    if (memories.length > 0) {
      this.summary.totalMemory = memories.reduce((a, b) => a + b, 0);
      this.summary.avgMemory = Math.round(
        this.summary.totalMemory / memories.length
      );
    }

    // Calculate score
    this.score.obtained = Math.round((passed / total) * this.score.maximum);
    this.score.percentage = Math.round((passed / total) * 100);
  }

  next();
});

// Static method: Get latest submission for a question
submissionSchema.statics.getLatestSubmission = async function (
  questionId,
  candidateId,
  meetingId
) {
  return this.findOne({
    question: questionId,
    candidate: candidateId,
    meeting: meetingId,
    submissionType: 'submit',
  }).sort({ createdAt: -1 });
};

// Static method: Get all submissions for a meeting
submissionSchema.statics.getMeetingSubmissions = async function (meetingId) {
  return this.find({ meeting: meetingId, submissionType: 'submit' })
    .populate('question', 'title questionNumber difficulty')
    .sort({ createdAt: -1 });
};

// Static method: Mark previous submissions as not latest
submissionSchema.statics.markPreviousAsOld = async function (
  questionId,
  candidateId,
  meetingId
) {
  await this.updateMany(
    {
      question: questionId,
      candidate: candidateId,
      meeting: meetingId,
      isLatestSubmission: true,
    },
    { isLatestSubmission: false }
  );
};

export default mongoose.model('Submission', submissionSchema);