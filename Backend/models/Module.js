const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    content: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }, // Reference to associated quiz
    order: { type: Number, default: 0 }, // For ordering modules within a course
    isCompulsory: { type: Boolean, default: true }, // Flag to indicate if module is compulsory or optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", moduleSchema);
