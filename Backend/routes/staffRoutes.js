const express = require("express");
const staffController = require("../controllers/staffController");
const { protect, restrictTo } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(restrictTo("admin", "staff"));

// Staff routes with multer for handling file uploads
router
  .route("/")
  .get(staffController.getStaffMembers)
  .post(upload.single("avatar"), staffController.createStaffMember);

router
  .route("/:id")
  .get(staffController.getStaffMemberById)
  .put(upload.single("avatar"), staffController.updateStaffMember)
  .delete(staffController.deleteStaffMember);

module.exports = router;
