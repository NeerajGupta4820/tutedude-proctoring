import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: null,
    },
    resume: {
      type: String,
      default: null,
    },
    position: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior'],
      default: 'fresher',
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'rejected'],
      default: 'pending',
    },
    interviewDate: Date,
    notes: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
candidateSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  // Don't hash if password is null/undefined
  if (!this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
candidateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

candidateSchema.index({ email: 1 });
candidateSchema.index({ status: 1 });

export default mongoose.model('Candidate', candidateSchema);
