const express = require('express');
const roleController = require('../controllers/roleController');
const { protect, restrictTo, hasPermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../utils/permissions');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Only apply admin restriction to role management routes
// We'll handle specific permissions for each route

// Role routes
router.route('/')
  .get(roleController.getAllRoles) // Allow all authenticated users to get roles
  .post(restrictTo('admin'), hasPermission(PERMISSIONS?.SYSTEM_SETTINGS?.MANAGE_ROLES), roleController.createRole);

router.route('/:id')
  .get(roleController.getRoleById) // Allow all authenticated users to get role details
  .put(restrictTo('admin'), hasPermission(PERMISSIONS?.SYSTEM_SETTINGS?.MANAGE_ROLES), roleController.updateRole)
  .delete(restrictTo('admin'), hasPermission(PERMISSIONS?.SYSTEM_SETTINGS?.MANAGE_ROLES), roleController.deleteRole);

// Permission routes
router.get('/permissions', restrictTo('admin'), hasPermission(PERMISSIONS?.SYSTEM_SETTINGS?.MANAGE_ROLES), roleController.getAllPermissions);
router.get('/permissions/categories', restrictTo('admin'), hasPermission(PERMISSIONS?.SYSTEM_SETTINGS?.MANAGE_ROLES), roleController.getPermissionsByCategory);

// User role assignment route
router.post('/users/:userId/role', restrictTo('admin', 'university'), hasPermission(PERMISSIONS?.USER_MANAGEMENT?.ASSIGN_ROLES), roleController.assignRoleToUser);

module.exports = router;
