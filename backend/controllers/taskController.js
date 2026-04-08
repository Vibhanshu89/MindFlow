const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

/**
 * @route   GET /api/tasks/project/:projectId
 * @desc    Get all tasks in a project
 * @access  Private
 */
const getTasksByProject = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('dependencies', 'title status')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/my
 * @desc    Get tasks assigned to current user
 * @access  Private
 */
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name color')
      .populate('assignedTo', 'name avatar')
      .sort({ deadline: 1 });

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .populate('dependencies', 'title status priority');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, priority, deadline, estimatedHours, dependencies, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      deadline,
      estimatedHours,
      dependencies,
      tags,
    });

    // Add task to project
    await Project.findByIdAndUpdate(project, { $push: { tasks: task._id } });

    // Send notification to assigned user
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you a task: "${title}"`,
        data: { projectId: project, taskId: task._id },
      });

      // Emit real-time notification
      if (req.io) {
        req.io.to(`user:${assignedTo}`).emit('notification:new', notification);
      }
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (req.io) {
      req.io.to(`project:${project}`).emit('task:created', populated);
    }

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task (including status for Kanban drag)
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldAssignee = task.assignedTo?.toString();
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Notify new assignee if changed
    if (req.body.assignedTo && req.body.assignedTo !== oldAssignee) {
      const notification = await Notification.create({
        recipient: req.body.assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        title: 'Task Reassigned',
        message: `${req.user.name} assigned you task: "${updatedTask.title}"`,
        data: { projectId: task.project, taskId: task._id },
      });
      if (req.io) {
        req.io.to(`user:${req.body.assignedTo}`).emit('notification:new', notification);
      }
    }

    // Update project progress when task status changes
    if (req.body.status) {
      const project = await Project.findById(task.project);
      if (project) await project.calculateProgress();
    }

    if (req.io) {
      req.io.to(`project:${task.project}`).emit('task:updated', updatedTask);
    }

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } });
    await task.deleteOne();

    if (req.io) {
      req.io.to(`project:${task.project}`).emit('task:deleted', { taskId: req.params.id });
    }

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id/status
 * @desc    Update task status (Kanban drag and drop)
 * @access  Private
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, order },
      { new: true }
    ).populate('assignedTo', 'name avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Update project progress
    const project = await Project.findById(task.project);
    if (project) await project.calculateProgress();

    if (req.io) {
      req.io.to(`project:${task.project}`).emit('task:status_changed', task);
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks/:id/comment
 * @desc    Add comment to task
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: { user: req.user._id, text, createdAt: new Date() },
        },
      },
      { new: true }
    ).populate('comments.user', 'name avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.io) {
      req.io.to(`project:${task.project}`).emit('task:comment_added', task);
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasksByProject, getMyTasks, getTask, createTask, updateTask, deleteTask, updateTaskStatus, addComment };
