const express = require('express');
const moduleProgressController = require('../controllers/moduleProgressController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Module progress routes
router.get('/course/:courseId', moduleProgressController.getModuleProgress);
router.post('/course/:courseId', moduleProgressController.updateModuleProgress);

module.exports = router;
