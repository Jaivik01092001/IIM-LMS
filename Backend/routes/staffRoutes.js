const express = require('express');
const staffController = require('../controllers/staffController');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(restrictTo('admin'));

// Staff routes
router.route('/')
  .get(staffController.getStaffMembers)
  .post(staffController.createStaffMember);

router.route('/:id')
  .get(staffController.getStaffMemberById)
  .put(staffController.updateStaffMember)
  .delete(staffController.deleteStaffMember);

router.route('/:id/password')
  .put(staffController.updateStaffMemberPassword);

module.exports = router;
