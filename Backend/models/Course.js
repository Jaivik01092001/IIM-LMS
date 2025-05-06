const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }], // Legacy field, kept for backward compatibility
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }], // References to Module documents
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    enrolledUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["in_progress", "completed"],
          default: "in_progress",
        },
        enrolledAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        progress: { type: Number, default: 0 }, // 0-100%
        lastAccessedAt: { type: Date },
        certificate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Certificate",
        }, // Reference to the certificate
      },
    ],
    description: { type: String },
    duration: { type: String },
    language: { type: String, default: "en" },
    thumbnail: { type: String }, // URL to course thumbnail image
    hasModules: { type: Boolean, default: true }, // Flag to indicate if course uses module structure (always true now)
    isDraft: { type: Boolean, default: true }, // Whether the course is a draft or published
    status: { type: Number, default: 1 }, // 1: active, 0: inactive (soft delete)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
