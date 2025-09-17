import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  eventType: String,
  timestamp: Date,
  details: Object,
});

export default mongoose.model('Log', logSchema);
