const mongoose = require('mongoose');

const standupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    // What did you work on yesterday?
    yesterday: {
      type: String,
      required: [true, 'Yesterday update is required'],
      maxlength: [1000, 'Yesterday field cannot exceed 1000 characters'],
    },
    // What will you work on today?
    today: {
      type: String,
      required: [true, 'Today plan is required'],
      maxlength: [1000, 'Today field cannot exceed 1000 characters'],
    },
    // Any blockers?
    blockers: {
      type: String,
      maxlength: [500, 'Blockers field cannot exceed 500 characters'],
      default: '',
    },
    // AI-generated insights
    aiSummary: {
      type: String,
    },
    aiBlockers: [String],
    aiSuggestions: [String],
    aiSentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'concerning'],
      default: 'neutral',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Standup', standupSchema);
