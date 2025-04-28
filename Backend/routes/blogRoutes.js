const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController.js");
const { protect } = require("../middleware/auth"); // Your auth middleware
const upload = require("../middleware/uploads"); // For file uploads

// Protected routes for admin/educators to create/update blogs
router.post("/", protect, upload.single('coverImage'), blogController.createBlog);
router.put("/:id", protect, upload.single('coverImage'), blogController.updateBlog);
router.delete("/:id", protect, blogController.deleteBlog);

// Admin routes for managing deleted blogs
router.put("/:id/restore", protect, blogController.restoreBlog);
router.get("/deleted", protect, blogController.getDeletedBlogs);

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

module.exports = router;
