const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // For SEO URL
    shortDescription: { type: String, required: true },
    content: { type: String, required: true }, // Can be rich text
    coverImage: { type: String }, // local URL
    tags: [{ type: String }], // Optional tags
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Author
    isDeleted: { type: Boolean, default: false },
    activeStatus: { type: Number, default: 1 }, // 1: active, 0: inactive (soft delete)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);