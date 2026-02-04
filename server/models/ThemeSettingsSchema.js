import mongoose from 'mongoose';

const ThemeSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    selectedTheme: {
      type: String,
      enum: ['midnight', 'ocean', 'forest', 'sunset', 'royal', 'minimal'],
      default: 'midnight',
    },
    customColors: {
      primary: { type: String, default: '#0891b2' }, // cyan-600
      secondary: { type: String, default: '#7c3aed' }, // violet-600
      background: { type: String, default: '#0f172a' }, // slate-900
      surface: { type: String, default: '#1e293b' }, // slate-800
      accent: { type: String, default: '#22d3ee' }, // cyan-400
      text: { type: String, default: '#f8fafc' }, // slate-50
      textMuted: { type: String, default: '#94a3b8' }, // slate-400
    },
    useCustomColors: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ThemeSettings', ThemeSettingsSchema);
