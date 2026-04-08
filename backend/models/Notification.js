const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'task_completed',
        'deadline_reminder',
        'project_invite',
        'project_update',
        'ai_insight',
        'comment',
        'mention',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

// Index for fast queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
