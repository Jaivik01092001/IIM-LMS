const express = require('express');
const universityController = require('../controllers/universityController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/uploads');
const router = express.Router();

// Apply authentication middleware to all routes
// Restrict all routes to university role

router.post('/educator', protect, upload.single('profileImage'), universityController.createEducator);
router.get('/educators', protect, universityController.getEducators);
router.get('/educator/:id', protect, universityController.getEducatorById);
router.put('/educator/:id', protect, upload.single('profileImage'), universityController.updateEducator);
router.delete('/educator/:id', protect, universityController.deleteEducator);
router.put('/profile', protect, universityController.updateProfile);
router.put('/password', protect, universityController.updatePassword);

module.exports = router;