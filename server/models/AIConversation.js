import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxLength: [200, 'Title too long'],
    },

    lastMessage: {
      content: {
        type: String,
        default: '',
      },
      role: {
        type: String,
        enum: ['user', 'assistant'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },

    messageCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ user: 1, isDeleted: 1, updatedAt: -1 });
aiConversationSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });
aiConversationSchema.index({ user: 1, status: 1 });

export default mongoose.model('AIConversation', aiConversationSchema);
