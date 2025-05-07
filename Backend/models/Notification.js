const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["comment_reply", "course_enrollment", "certificate_issued"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    relatedModel: {
      type: String,
      enum: ["Course", "Comment", "Certificate"],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    read: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 1, // 1: active, 0: inactive (soft delete)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
