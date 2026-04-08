const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @route   GET /api/projects
 * @desc    Get all projects user belongs to
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project with tasks
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate({
        path: 'tasks',
        populate: { path: 'assignedTo', select: 'name email avatar' },
      });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check access
    const isMember =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user._id.toString() === req.user._id.toString());

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects
 * @desc    Create project
 * @access  Private (Admin, Manager)
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, deadline, priority, members, tags, color } = req.body;

    const project = await Project.create({
      name,
      description,
      deadline,
      priority,
      tags,
      color: color || '#6366f1',
      owner: req.user._id,
      members: members
        ? members.map((m) => ({ user: m.userId, role: m.role || 'developer' }))
        : [],
    });

    // Add project to owner's projects list
    await User.findByIdAndUpdate(req.user._id, { $push: { projects: project._id } });

    // Add project to members' projects list & send notifications
    if (members && members.length > 0) {
      const notificationPromises = members.map(async (m) => {
        await User.findByIdAndUpdate(m.userId, { $push: { projects: project._id } });

        return Notification.create({
          recipient: m.userId,
          sender: req.user._id,
          type: 'project_invite',
          title: 'Project Invitation',
          message: `${req.user.name} added you to project "${name}"`,
          data: { projectId: project._id },
        });
      });
      await Promise.all(notificationPromises);
    }

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    // Emit socket event
    if (req.io) {
      req.io.emit('project:created', populated);
    }

    res.status(201).json({ success: true, project: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only owner or admin can update
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (req.io) {
      req.io.to(`project:${project._id}`).emit('project:updated', project);
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Owner or Admin)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete all associated tasks
    await Task.deleteMany({ project: project._id });

    // Remove project from users
    await User.updateMany({ projects: project._id }, { $pull: { projects: project._id } });

    await project.deleteOne();

    if (req.io) {
      req.io.emit('project:deleted', { projectId: req.params.id });
    }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add member to project
 * @access  Private (Owner or Manager)
 */
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const alreadyMember = project.members.some((m) => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User already a member' });
    }

    project.members.push({ user: userId, role: role || 'developer' });
    await project.save();

    await User.findByIdAndUpdate(userId, { $push: { projects: project._id } });

    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'project_invite',
      title: 'Added to Project',
      message: `${req.user.name} added you to "${project.name}"`,
      data: { projectId: project._id },
    });

    const updated = await Project.findById(project._id).populate('members.user', 'name email avatar');
    res.json({ success: true, project: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/stats
 * @desc    Get project stats for dashboard
 * @access  Private
 */
const getProjectStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalProjects, activeProjects, completedProjects, totalTasks, recentProjects] =
      await Promise.all([
        Project.countDocuments({ $or: [{ owner: userId }, { 'members.user': userId }] }),
        Project.countDocuments({
          $or: [{ owner: userId }, { 'members.user': userId }],
          status: 'active',
        }),
        Project.countDocuments({
          $or: [{ owner: userId }, { 'members.user': userId }],
          status: 'completed',
        }),
        Task.countDocuments({ assignedTo: userId }),
        Project.find({
          $or: [{ owner: userId }, { 'members.user': userId }],
        })
          .select('name status progress deadline color')
          .sort({ updatedAt: -1 })
          .limit(5),
      ]);

    const taskStats = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        recentProjects,
        taskStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, getProjectStats };
