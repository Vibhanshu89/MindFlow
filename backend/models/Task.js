const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
    },
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    tags: [String],
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    aiPriorityScore: {
      type: Number,
      default: 0,
    },
    aiPriorityReason: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
