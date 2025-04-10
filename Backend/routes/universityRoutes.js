const express = require('express');
const universityController = require('../controllers/universityController');
const router = express.Router();

router.post('/educator', universityController.createEducator);
router.get('/educators', universityController.getEducators);
router.put('/educator/:id', universityController.updateEducator);
router.put('/profile', universityController.updateProfile);
router.put('/password', universityController.updatePassword);

module.exports = router;