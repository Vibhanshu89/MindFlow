const Notification = require('../models/Notification');

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, read: false }),
    ]);

    res.json({ success: true, notifications, total, unreadCount, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
