const express = require('express');
const universityController = require('../controllers/universityController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/educator', protect, universityController.createEducator);
router.get('/educators', protect, universityController.getEducators);
router.put('/educator/:id', protect, universityController.updateEducator);
router.put('/profile', protect, universityController.updateProfile);
router.put('/password', protect, universityController.updatePassword);

module.exports = router;