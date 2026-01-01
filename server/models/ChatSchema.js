// models/chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: [true, 'Meeting ID is required'],
      index: true,
    },

    roomId: {
      type: String,
      required: true,
      index: true,
    },

    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      userType: {
        type: String,
        enum: ['User', 'Candidate'],
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      avatar: String,
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxLength: [2000, 'Message too long'],
    },

    messageType: {
      type: String,
      enum: ['text', 'code', 'file', 'system'],
      default: 'text',
    },

    codeSnippet: {
      language: String,
      code: String,
    },

    attachment: {
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
    },

    readBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        readAt: { type: Date, default: Date.now },
      },
    ],

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

// Indexes for fast queries
chatSchema.index({ meeting: 1, createdAt: 1 });
chatSchema.index({ roomId: 1, createdAt: 1 });
chatSchema.index({ meeting: 1, isDeleted: 1 });

export default mongoose.model('Chat', chatSchema);
