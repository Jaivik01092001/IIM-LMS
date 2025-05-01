const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController.js");
const { protect, hasPermission, restrictTo } = require("../middleware/auth");
const { PERMISSIONS } = require("../utils/permissions");
const upload = require("../middleware/uploads"); // For file uploads

// Public routes - no authentication required
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

// Protected routes with permission checks
// Create blog - requires create_blog permission
router.post(
  "/",
  protect,
  hasPermission(PERMISSIONS.BLOG_MANAGEMENT.CREATE_BLOG),
  upload.single("coverImage"),
  blogController.createBlog
);

// Update blog - requires edit_blog permission
router.put(
  "/:id",
  protect,
  hasPermission(PERMISSIONS.BLOG_MANAGEMENT.EDIT_BLOG),
  upload.single("coverImage"),
  blogController.updateBlog
);

// Delete blog - requires delete_blog permission
router.delete(
  "/:id",
  protect,
  hasPermission(PERMISSIONS.BLOG_MANAGEMENT.DELETE_BLOG),
  blogController.deleteBlog
);

// Admin-only routes for managing deleted blogs
// Restore deleted blog - admin only
router.put(
  "/:id/restore",
  protect,
  restrictTo("admin"),
  hasPermission(PERMISSIONS.BLOG_MANAGEMENT.EDIT_BLOG),
  blogController.restoreBlog
);

// View deleted blogs - admin only
router.get(
  "/deleted",
  protect,
  restrictTo("admin"),
  hasPermission(PERMISSIONS.BLOG_MANAGEMENT.VIEW_BLOGS),
  blogController.getDeletedBlogs
);

module.exports = router;
