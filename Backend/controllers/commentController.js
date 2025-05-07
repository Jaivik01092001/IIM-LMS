const Course = require("../models/Course");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// Get all comments for a course
exports.getCourseComments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .select("comments")
      .populate({
        path: "comments.user",
        select: "name profile.avatar role university",
      })
      .populate({
        path: "comments.replies.user",
        select: "name profile.avatar role university",
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course.comments);
  } catch (error) {
    console.error("Error retrieving course comments:", error);
    res.status(500).json({
      message: "Error retrieving course comments",
      error: error.message,
    });
  }
};

// Add a comment to a course
exports.addCourseComment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Add the comment
    course.comments.push({
      user: userId,
      text,
      date: new Date(),
    });

    await course.save();

    // Return the updated comments with populated user data
    const updatedCourse = await Course.findById(courseId)
      .select("comments")
      .populate({
        path: "comments.user",
        select: "name profile.avatar",
      });

    res.status(201).json({
      message: "Comment added successfully",
      comments: updatedCourse.comments,
    });
  } catch (error) {
    console.error("Error adding course comment:", error);
    res.status(500).json({
      message: "Error adding course comment",
      error: error.message,
    });
  }
};

// Update a comment
exports.updateCourseComment = async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the comment
    const comment = course.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check permissions based on role
    let canEdit = false;

    // Admin and staff can edit any comment
    if (userRole === "admin" || userRole === "staff") {
      canEdit = true;
    }
    // School (university) can edit comments made by educators under their institution
    else if (userRole === "university") {
      // If the comment was made by an educator under this university
      const commentUser = await User.findById(comment.user);
      if (
        commentUser &&
        commentUser.role === "educator" &&
        commentUser.university &&
        commentUser.university.toString() === userId
      ) {
        canEdit = true;
      }
      // Or if the comment is their own
      else if (comment.user.toString() === userId) {
        canEdit = true;
      }
    }
    // Educators can only edit their own comments
    else if (comment.user.toString() === userId) {
      canEdit = true;
    }

    if (!canEdit) {
      return res.status(403).json({
        message: "You are not authorized to update this comment",
      });
    }

    // Update the comment
    comment.text = text;
    comment.date = new Date(); // Update the date to reflect the edit time

    await course.save();

    // Return the updated comments with populated user data
    const updatedCourse = await Course.findById(courseId)
      .select("comments")
      .populate({
        path: "comments.user",
        select: "name profile.avatar role university",
      })
      .populate({
        path: "comments.replies.user",
        select: "name profile.avatar role university",
      });

    res.json({
      message: "Comment updated successfully",
      comments: updatedCourse.comments,
    });
  } catch (error) {
    console.error("Error updating course comment:", error);
    res.status(500).json({
      message: "Error updating course comment",
      error: error.message,
    });
  }
};

// Delete a comment
exports.deleteCourseComment = async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the comment
    const comment = course.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check permissions based on role
    let canDelete = false;

    // Admin and staff can delete any comment
    if (userRole === "admin" || userRole === "staff") {
      canDelete = true;
    }
    // School (university) can delete comments made by educators under their institution
    else if (userRole === "university") {
      // If the comment was made by an educator under this university
      const commentUser = await User.findById(comment.user);
      if (
        commentUser &&
        commentUser.role === "educator" &&
        commentUser.university &&
        commentUser.university.toString() === userId
      ) {
        canDelete = true;
      }
      // Or if the comment is their own
      else if (comment.user.toString() === userId) {
        canDelete = true;
      }
    }
    // Educators can only delete their own comments
    else if (comment.user.toString() === userId) {
      canDelete = true;
    }

    if (!canDelete) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }

    // Remove the comment
    course.comments.pull(commentId);
    await course.save();

    res.json({
      message: "Comment deleted successfully",
      commentId,
    });
  } catch (error) {
    console.error("Error deleting course comment:", error);
    res.status(500).json({
      message: "Error deleting course comment",
      error: error.message,
    });
  }
};

// Add a reply to a comment
exports.addCommentReply = async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    const { text, parentReplyId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const course = await Course.findById(courseId)
      .select("comments title")
      .populate({
        path: "comments.user",
        select: "name profile.avatar role university",
      })
      .populate({
        path: "comments.replies.user",
        select: "name profile.avatar role university",
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the parent comment
    const comment = course.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Create the reply object
    const replyData = {
      user: userId,
      text,
      date: new Date(),
    };

    // If this is a reply to another reply, add the parentId
    if (parentReplyId) {
      // Verify the parent reply exists
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply) {
        return res.status(404).json({ message: "Parent reply not found" });
      }
      replyData.parentId = parentReplyId;
    }

    // Add the reply
    comment.replies.push(replyData);
    await course.save();

    // Determine the recipient for notification
    let recipientId;
    let notificationContent;

    if (parentReplyId) {
      // If replying to a reply, notify the reply author
      const parentReply = comment.replies.id(parentReplyId);
      recipientId = parentReply.user._id || parentReply.user;

      // Get current user's name for the notification
      const currentUser = await User.findById(userId).select("name");
      const recipientUser = await User.findById(recipientId).select("name");

      notificationContent = `${currentUser.name} replied to your comment on "${course.title}"`;
    } else {
      // If replying to the main comment, notify the comment author
      recipientId = comment.user._id || comment.user;

      // Get current user's name for the notification
      const currentUser = await User.findById(userId).select("name");

      notificationContent = `${currentUser.name} replied to your comment on "${course.title}"`;
    }

    // Send notification if the recipient is not the same as the sender
    if (recipientId.toString() !== userId) {
      // Create notification
      await createNotification(
        recipientId, // recipient
        userId, // sender (reply author)
        "comment_reply", // type
        notificationContent, // content
        "Comment", // relatedModel
        commentId, // relatedId
        courseId, // courseId
        commentId // commentId
      );
    }

    // Return the updated comments with populated user data
    const updatedCourse = await Course.findById(courseId)
      .select("comments")
      .populate({
        path: "comments.user",
        select: "name profile.avatar role university",
      })
      .populate({
        path: "comments.replies.user",
        select: "name profile.avatar role university",
      });

    res.status(201).json({
      message: "Reply added successfully",
      comments: updatedCourse.comments,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({
      message: "Error adding reply",
      error: error.message,
    });
  }
};

// Update a reply
exports.updateCommentReply = async (req, res) => {
  try {
    const { courseId, commentId, replyId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the parent comment
    const comment = course.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Find the reply
    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check permissions based on role
    let canEdit = false;

    // Admin and staff can edit any reply
    if (userRole === "admin" || userRole === "staff") {
      canEdit = true;
    }
    // School (university) can edit replies made by educators under their institution
    else if (userRole === "university") {
      // If the reply was made by an educator under this university
      const replyUser = await User.findById(reply.user);
      if (
        replyUser &&
        replyUser.role === "educator" &&
        replyUser.university &&
        replyUser.university.toString() === userId
      ) {
        canEdit = true;
      }
      // Or if the reply is their own
      else if (reply.user.toString() === userId) {
        canEdit = true;
      }
    }
    // Educators can only edit their own replies
    else if (reply.user.toString() === userId) {
      canEdit = true;
    }

    if (!canEdit) {
      return res.status(403).json({
        message: "You are not authorized to update this reply",
      });
    }

    // Update the reply
    reply.text = text;
    reply.date = new Date(); // Update the date to reflect the edit time

    await course.save();

    // Return the updated comments with populated user data
    const updatedCourse = await Course.findById(courseId)
      .select("comments")
      .populate({
        path: "comments.user",
        select: "name profile.avatar role university",
      })
      .populate({
        path: "comments.replies.user",
        select: "name profile.avatar role university",
      });

    res.json({
      message: "Reply updated successfully",
      comments: updatedCourse.comments,
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(500).json({
      message: "Error updating reply",
      error: error.message,
    });
  }
};

// Delete a reply
exports.deleteCommentReply = async (req, res) => {
  try {
    const { courseId, commentId, replyId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the parent comment
    const comment = course.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Find the reply
    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check permissions based on role
    let canDelete = false;

    // Admin and staff can delete any reply
    if (userRole === "admin" || userRole === "staff") {
      canDelete = true;
    }
    // School (university) can delete replies made by educators under their institution
    else if (userRole === "university") {
      // If the reply was made by an educator under this university
      const replyUser = await User.findById(reply.user);
      if (
        replyUser &&
        replyUser.role === "educator" &&
        replyUser.university &&
        replyUser.university.toString() === userId
      ) {
        canDelete = true;
      }
      // Or if the reply is their own
      else if (reply.user.toString() === userId) {
        canDelete = true;
      }
    }
    // Educators can only delete their own replies
    else if (reply.user.toString() === userId) {
      canDelete = true;
    }

    if (!canDelete) {
      return res.status(403).json({
        message: "You are not authorized to delete this reply",
      });
    }

    // Remove the reply
    comment.replies.pull(replyId);
    await course.save();

    res.json({
      message: "Reply deleted successfully",
      commentId,
      replyId,
    });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({
      message: "Error deleting reply",
      error: error.message,
    });
  }
};
