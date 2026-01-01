import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    phone: { type: String, trim: true },
    description: { type: String, trim: true },

    // Cloudinary URLs
    photo: { type: String, default: null },
    photoPublicId: { type: String, default: null, select: false },
    resume: { type: String, default: null },
    resumePublicId: { type: String, default: null, select: false },

    position: { type: String, trim: true },
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
    notes: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

candidateSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

candidateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Candidate', candidateSchema);
