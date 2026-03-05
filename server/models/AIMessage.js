import mongoose from 'mongoose';

const aiMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: [true, 'Conversation is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: [true, 'role is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    tokenUsage: {
      promptTokens: Number,
      completionTokens: Number,
      totaltokens: Number,
    },
    model: {
      type: String,
      default: 'llama3.2',
    },
    responseTime: {
      type: Number,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: {
        type: String, 
        enum: ['like', 'dislike', null],
        default: null,
      },
      comment: String,
      feedbackAt: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

aiMessageSchema.index({ conversation: 1, createdAt: 1 });
aiMessageSchema.index({ conversation: 1, isDeleted: 1, createdAt: 1 });

export default mongoose.model('AIMessage', aiMessageSchema);