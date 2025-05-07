const Notification = require("../models/Notification");
const User = require("../models/User");

// Get all notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      recipient: userId,
      status: 1,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "sender",
        select: "name profile.avatar role",
      })
      .populate({
        path: "courseId",
        select: "title thumbnail",
      });

    res.json(notifications);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure the notification belongs to the current user
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this notification",
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      message: "Notification marked as read",
      notificationId,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false, status: 1 },
      { read: true }
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

// Delete a notification (soft delete)
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure the notification belongs to the current user
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this notification",
      });
    }

    // Soft delete
    notification.status = 0;
    await notification.save();

    res.json({
      message: "Notification deleted successfully",
      notificationId,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// Create a notification (internal use only)
exports.createNotification = async (
  recipient,
  sender,
  type,
  content,
  relatedModel,
  relatedId,
  courseId = null,
  commentId = null
) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      content,
      relatedModel,
      relatedId,
      courseId,
      commentId,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
