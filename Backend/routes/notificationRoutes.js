const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(protect);

// Get all notifications for the current user
router.get("/", notificationController.getUserNotifications);

// Mark a notification as read
router.put("/:notificationId/read", notificationController.markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", notificationController.markAllNotificationsAsRead);

// Delete a notification (soft delete)
router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
