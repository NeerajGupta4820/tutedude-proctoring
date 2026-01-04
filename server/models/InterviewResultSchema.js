import mongoose from 'mongoose';

const interviewResultSchema = new mongoose.Schema(
  {
    // References
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Question-wise Results
    questionResults: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        questionNumber: Number,
        title: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
        },

        // Submission Reference
        latestSubmission: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Submission',
        },
        totalAttempts: {
          type: Number,
          default: 0,
        },

        // Result
        status: {
          type: String,
          enum: [
            'not_attempted',
            'attempted',
            'partially_solved',
            'solved',
            'time_limit_exceeded',
            'wrong_answer',
          ],
          default: 'not_attempted',
        },

        // Scores
        testCasesPassed: {
          type: Number,
          default: 0,
        },
        totalTestCases: {
          type: Number,
          default: 0,
        },
        score: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },

        // Performance
        bestRuntime: Number,
        bestMemory: Number,
        language: String,

        // Time Tracking
        timeSpent: Number, // in seconds
        firstAttemptAt: Date,
        lastAttemptAt: Date,
        solvedAt: Date,

        // Interviewer Evaluation
        interviewerRating: {
          type: Number,
          min: 0,
          max: 10,
        },
        interviewerComment: String,
        codeQualityRating: {
          type: Number,
          min: 0,
          max: 10,
        },
        approachRating: {
          type: Number,
          min: 0,
          max: 10,
        },
      },
    ],

    // Overall Coding Score
    codingScore: {
      totalQuestions: {
        type: Number,
        default: 0,
      },
      attempted: {
        type: Number,
        default: 0,
      },
      solved: {
        type: Number,
        default: 0,
      },
      partiallySolved: {
        type: Number,
        default: 0,
      },
      totalScore: {
        type: Number,
        default: 0,
      },
      maxScore: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
      avgRuntime: Number,
      avgMemory: Number,
    },

    // Overall Interview Evaluation
    overallEvaluation: {
      // Technical Skills
      technicalScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      problemSolvingScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      codeQualityScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      dataStructuresScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      algorithmsScore: {
        type: Number,
        min: 0,
        max: 10,
      },

      // Soft Skills
      communicationScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      attitudeScore: {
        type: Number,
        min: 0,
        max: 10,
      },

      // Overall
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      overallRating: {
        type: Number,
        min: 0,
        max: 10,
      },
    },

    // Final Result
    result: {
      type: String,
      enum: [
        'pending',
        'pass',
        'fail',
        'on_hold',
        'disqualified',
        'cheating_detected',
        'no_show',
      ],
      default: 'pending',
    },
    resultReason: String,

    // Interviewer Feedback
    feedback: {
      strengths: [String],
      weaknesses: [String],
      improvements: [String],
      overallComment: String,
      recommendation: {
        type: String,
        enum: [
          'strongly_recommend',
          'recommend',
          'neutral',
          'not_recommend',
          'strongly_not_recommend',
        ],
      },
      hiringDecision: {
        type: String,
        enum: ['hire', 'no_hire', 'maybe', 'pending'],
        default: 'pending',
      },
    },

    // Proctoring/Integrity
    integrityFlags: {
      tabSwitchCount: {
        type: Number,
        default: 0,
      },
      copyPasteDetected: {
        type: Boolean,
        default: false,
      },
      suspiciousActivity: {
        type: Boolean,
        default: false,
      },
      plagiarismScore: Number,
      notes: String,
    },

    // Timing
    interviewStartTime: Date,
    interviewEndTime: Date,
    totalDuration: Number, // in minutes
    codingDuration: Number, // time spent on coding in minutes

    // Status Tracking
    isEvaluated: {
      type: Boolean,
      default: false,
    },
    evaluatedAt: Date,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
    finalizedAt: Date,
    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
interviewResultSchema.index({ meeting: 1 });
interviewResultSchema.index({ candidate: 1 });
interviewResultSchema.index({ result: 1 });
interviewResultSchema.index({ 'codingScore.percentage': -1 });
interviewResultSchema.index({ createdAt: -1 });

// Virtual: Is Passed
interviewResultSchema.virtual('isPassed').get(function () {
  return this.result === 'pass';
});

// Pre-save: Calculate overall scores
interviewResultSchema.pre('save', function (next) {
  // Calculate coding score summary
  if (this.questionResults && this.questionResults.length > 0) {
    const results = this.questionResults;

    this.codingScore.totalQuestions = results.length;
    this.codingScore.attempted = results.filter(
      (r) => r.status !== 'not_attempted'
    ).length;
    this.codingScore.solved = results.filter(
      (r) => r.status === 'solved'
    ).length;
    this.codingScore.partiallySolved = results.filter(
      (r) => r.status === 'partially_solved'
    ).length;

    // Calculate total score
    const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxScore = results.length * 100;

    this.codingScore.totalScore = totalScore;
    this.codingScore.maxScore = maxScore;
    this.codingScore.percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Calculate average runtime and memory
    const runtimes = results
      .filter((r) => r.bestRuntime)
      .map((r) => r.bestRuntime);
    const memories = results
      .filter((r) => r.bestMemory)
      .map((r) => r.bestMemory);

    if (runtimes.length > 0) {
      this.codingScore.avgRuntime = Math.round(
        runtimes.reduce((a, b) => a + b, 0) / runtimes.length
      );
    }
    if (memories.length > 0) {
      this.codingScore.avgMemory = Math.round(
        memories.reduce((a, b) => a + b, 0) / memories.length
      );
    }
  }

  // Calculate overall score from evaluation
  if (this.overallEvaluation) {
    const eval_ = this.overallEvaluation;
    const scores = [
      eval_.technicalScore,
      eval_.problemSolvingScore,
      eval_.codeQualityScore,
      eval_.communicationScore,
      eval_.attitudeScore,
    ].filter((s) => s !== undefined && s !== null);

    if (scores.length > 0) {
      const avgRating = scores.reduce((a, b) => a + b, 0) / scores.length;
      this.overallEvaluation.overallRating = Math.round(avgRating * 10) / 10;
      this.overallEvaluation.overallScore = Math.round(avgRating * 10);
    }
  }

  next();
});

// Static: Get or Create Interview Result
interviewResultSchema.statics.getOrCreate = async function (
  meetingId,
  candidateId,
  interviewerId
) {
  let result = await this.findOne({ meeting: meetingId });

  if (!result) {
    result = await this.create({
      meeting: meetingId,
      candidate: candidateId,
      interviewer: interviewerId,
    });
  }

  return result;
};

// Static: Update Question Result
interviewResultSchema.statics.updateQuestionResult = async function (
  meetingId,
  questionId,
  submissionData
) {
  const result = await this.findOne({ meeting: meetingId });
  if (!result) return null;

  const questionIndex = result.questionResults.findIndex(
    (qr) => qr.question.toString() === questionId.toString()
  );

  const questionResult = {
    question: questionId,
    questionNumber: submissionData.questionNumber,
    title: submissionData.title,
    difficulty: submissionData.difficulty,
    latestSubmission: submissionData.submissionId,
    totalAttempts: submissionData.attemptNumber,
    status: submissionData.status,
    testCasesPassed: submissionData.passedTestCases,
    totalTestCases: submissionData.totalTestCases,
    score: submissionData.score,
    bestRuntime: submissionData.runtime,
    bestMemory: submissionData.memory,
    language: submissionData.language,
    lastAttemptAt: new Date(),
  };

  if (submissionData.status === 'solved') {
    questionResult.solvedAt = new Date();
  }

  if (questionIndex >= 0) {
    // Update existing
    result.questionResults[questionIndex] = {
      ...result.questionResults[questionIndex].toObject(),
      ...questionResult,
    };
  } else {
    // Add new
    questionResult.firstAttemptAt = new Date();
    result.questionResults.push(questionResult);
  }

  await result.save();
  return result;
};

export default mongoose.model('InterviewResult', interviewResultSchema);
