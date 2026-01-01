import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    questionNumber: {
      type: Number,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Question description is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      default: 'medium',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Array', 'String', 'Hash Table', 'Dynamic Programming',
        'Math', 'Sorting', 'Greedy', 'Depth-First Search',
        'Binary Search', 'Database', 'Breadth-First Search',
        'Tree', 'Matrix', 'Two Pointers', 'Binary Tree',
        'Bit Manipulation', 'Stack', 'Design', 'Heap (Priority Queue)',
        'Graph', 'Simulation', 'Counting', 'Backtracking',
        'Sliding Window', 'Union Find', 'Linked List',
        'Ordered Set', 'Monotonic Stack', 'Enumeration',
        'Recursion', 'Divide and Conquer', 'Queue',
        'Trie', 'Segment Tree', 'Binary Search Tree',
        'Bitmask', 'Topological Sort', 'Game Theory'
      ],
    },
    tags: [{
      type: String,
    }],
    companies: [{
      name: String,
      frequency: { type: Number, min: 0, max: 10 },
    }],
    problemStatement: {
      type: String,
      required: true,
    },
    inputFormat: {
      type: String,
      required: true,
    },
    outputFormat: {
      type: String,
      required: true,
    },
    constraints: [{
      type: String,
      required: true,
    }],
    examples: [{
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explanation: String,
      image: String,
    }],
    testCases: [{
      input: {
        type: String,
        required: true,
      },
      expectedOutput: {
        type: String,
        required: true,
      },
      isHidden: {
        type: Boolean,
        default: false,
      },
      isSample: {
        type: Boolean,
        default: false,
      },
      explanation: String,
    }],
    supportedLanguages: [{
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'],
      default: ['javascript', 'python', 'java', 'cpp'],
    }],
    starterCode: {
      javascript: {
        code: String,
        functionName: String,
      },
      python: {
        code: String,
        functionName: String,
      },
      java: {
        code: String,
        className: String,
        functionName: String,
      },
      cpp: {
        code: String,
        functionName: String,
      },
      c: {
        code: String,
        functionName: String,
      },
    },
    solution: {
      approach: String,
      code: {
        javascript: String,
        python: String,
        java: String,
        cpp: String,
      },
      timeComplexity: {
        type: String,
        required: true,
      },
      spaceComplexity: {
        type: String,
        required: true,
      },
      explanation: String,
    },
    hints: [{
      level: { type: Number, required: true }, 
      text: { type: String, required: true },
    }],
    followUp: [String],
    similarQuestions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    }],
    acceptanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    totalAccepted: {
      type: Number,
      default: 0,
    },
    timeLimit: {
      type: Number,
      default: 3000,
    },
    memoryLimit: {
      type: Number,
      default: 256,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    createdBy: {
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
questionSchema.index({ difficulty: 1, category: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ questionNumber: 1 });
questionSchema.index({ slug: 1 });

// Auto-generate slug from title
questionSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Auto-increment question number
questionSchema.pre('save', async function(next) {
  if (this.isNew && !this.questionNumber) {
    const lastQuestion = await this.constructor.findOne().sort('-questionNumber');
    this.questionNumber = lastQuestion ? lastQuestion.questionNumber + 1 : 1;
  }
  next();
});

// Calculate acceptance rate
questionSchema.methods.updateAcceptanceRate = function() {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = Math.round((this.totalAccepted / this.totalSubmissions) * 100);
  }
};

export default mongoose.model('Question', questionSchema);