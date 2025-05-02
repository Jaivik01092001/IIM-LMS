const express = require("express");
const adminController = require("../controllers/adminController");
const upload = require("../middleware/uploads"); // For file uploads
const router = express.Router();
const { protect, hasPermission, restrictTo } = require("../middleware/auth");
const { PERMISSIONS } = require("../utils/permissions");

// Apply authentication middleware to all routes
router.use(protect);

// ===== User Routes =====
// View users - requires admin role
router.get("/users", restrictTo("admin"), adminController.getAllUsers);

// ===== Educator Management Routes =====
// View educators - requires view_educators permission
router.get(
  "/educators",
  hasPermission(PERMISSIONS.EDUCATOR_MANAGEMENT.VIEW_EDUCATORS),
  adminController.getAllEducators
);
// Create educator - requires create_educator permission
router.post(
  "/educators",
  hasPermission(PERMISSIONS.EDUCATOR_MANAGEMENT.CREATE_EDUCATOR),
  upload.single("profileImage"),
  adminController.createEducator
);
// View educator details - requires view_educators permission
router.get(
  "/educator/:id",
  hasPermission(PERMISSIONS.EDUCATOR_MANAGEMENT.VIEW_EDUCATORS),
  adminController.getEducatorById
);
// Update educator - requires edit_educator permission
router.put(
  "/educator/:id",
  hasPermission(PERMISSIONS.EDUCATOR_MANAGEMENT.EDIT_EDUCATOR),
  upload.single("profileImage"),
  adminController.updateEducator
);

// ===== School/University Management Routes =====
// View universities/schools - requires view_schools permission
router.get(
  "/universities",
  hasPermission(PERMISSIONS.SCHOOL_MANAGEMENT.VIEW_SCHOOLS),
  adminController.getUniversities
);
// View university/school details - requires view_schools permission
router.get(
  "/university/:id",
  hasPermission(PERMISSIONS.SCHOOL_MANAGEMENT.VIEW_SCHOOLS),
  adminController.getUniversityById
);
// Create university/school - requires create_school permission
router.post(
  "/university",
  hasPermission(PERMISSIONS.SCHOOL_MANAGEMENT.CREATE_SCHOOL),
  upload.single("profileImage"),
  adminController.createUniversity
);
// Update university/school - requires edit_school permission
router.put(
  "/university/:id",
  hasPermission(PERMISSIONS.SCHOOL_MANAGEMENT.EDIT_SCHOOL),
  upload.single("profileImage"),
  adminController.updateUniversity
);
// Delete university/school - requires delete_school permission
router.delete(
  "/university/:id",
  hasPermission(PERMISSIONS.SCHOOL_MANAGEMENT.DELETE_SCHOOL),
  adminController.deleteUniversity
);

// Add a route to handle OPTIONS requests for CORS preflight
router.options("/university/:id", (req, res) => {
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-auth-token");
  res.status(200).send();
});

// ===== Content Routes =====
// View content - admin or educator roles
router.get(
  "/content",
  restrictTo("admin", "educator"),
  adminController.getContent
);
// Create content - admin or educator roles
router.post(
  "/content",
  restrictTo("admin", "educator"),
  upload.single("file"),
  adminController.createContent
);
// Update content - admin or educator roles
router.put(
  "/content/:id",
  restrictTo("admin", "educator"),
  adminController.updateContent
);
// Approve content - admin only
router.put(
  "/content/approve/:id",
  restrictTo("admin"),
  adminController.approveContent
);
// Reject content - admin only
router.put(
  "/content/reject/:id",
  restrictTo("admin"),
  adminController.rejectContent
);
// Delete content - admin only
router.delete(
  "/content/:id",
  restrictTo("admin"),
  adminController.deleteContent
);

// ===== Course Management Routes =====
// View courses - requires view_courses permission
router.get(
  "/courses",
  hasPermission(PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES),
  adminController.getCourses
);
// Create course - requires create_course permission
router.post(
  "/course",
  hasPermission(PERMISSIONS.COURSE_MANAGEMENT.CREATE_COURSE),
  upload.any(),
  adminController.createCourse
);
// View course details - requires view_courses permission
router.get(
  "/course/:id",
  hasPermission(PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES),
  adminController.getCourse
);
// Update course - requires edit_course permission
router.put(
  "/course/:id",
  hasPermission(PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE),
  upload.any(),
  adminController.updateCourse
);
// Delete course - requires delete_course permission
router.delete(
  "/course/:id",
  hasPermission(PERMISSIONS.COURSE_MANAGEMENT.DELETE_COURSE),
  adminController.deleteCourse
);
// Add content to course - requires edit_course permission
router.post(
  "/course/content",
  hasPermission(PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE),
  adminController.addContentToCourse
);
// Add quiz to course - requires edit_course permission
router.post(
  "/course/quiz",
  hasPermission(PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE),
  adminController.addQuizToCourse
);

// ===== Quiz Routes =====
// Create quiz - admin or educator roles
router.post(
  "/quiz",
  restrictTo("admin", "educator"),
  adminController.createQuiz
);
// View quizzes - admin or educator roles
router.get(
  "/quizzes",
  restrictTo("admin", "educator"),
  adminController.getQuizzes
);
// View quiz details - admin or educator roles
router.get(
  "/quiz/:quizId",
  restrictTo("admin", "educator"),
  adminController.getQuiz
);
// Update quiz - admin or educator roles
router.put(
  "/quiz/:quizId",
  restrictTo("admin", "educator"),
  adminController.updateQuiz
);

// ===== Profile and Password Routes =====
// These routes are available to all authenticated users for their own profiles
router.put("/profile", adminController.updateProfile);
router.put("/password", adminController.updatePassword);

module.exports = router;
