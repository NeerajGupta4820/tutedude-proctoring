import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  interviewDate: Date,
});

export default mongoose.model('Candidate', candidateSchema);
