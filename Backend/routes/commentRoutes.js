const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(protect);

// Course comment routes
router.get("/course/:courseId", commentController.getCourseComments);
router.post("/course/:courseId", commentController.addCourseComment);
router.put(
  "/course/:courseId/:commentId",
  commentController.updateCourseComment
);
router.delete(
  "/course/:courseId/:commentId",
  commentController.deleteCourseComment
);

// Comment reply routes
router.post(
  "/course/:courseId/:commentId/reply",
  commentController.addCommentReply
);
router.put(
  "/course/:courseId/:commentId/reply/:replyId",
  commentController.updateCommentReply
);
router.delete(
  "/course/:courseId/:commentId/reply/:replyId",
  commentController.deleteCommentReply
);

module.exports = router;
