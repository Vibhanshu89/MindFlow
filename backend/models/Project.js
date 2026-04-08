const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold', 'cancelled'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['manager', 'developer', 'viewer'], default: 'developer' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    tags: [String],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiInsights: {
      riskAnalysis: String,
      suggestions: [String],
      lastAnalyzed: Date,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

// Auto-calculate progress from tasks
projectSchema.methods.calculateProgress = async function () {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  if (tasks.length === 0) {
    this.progress = 0;
  } else {
    const done = tasks.filter((t) => t.status === 'done').length;
    this.progress = Math.round((done / tasks.length) * 100);
  }
  return this.save();
};

module.exports = mongoose.model('Project', projectSchema);
