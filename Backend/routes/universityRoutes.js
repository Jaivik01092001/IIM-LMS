const express = require('express');
const {
  createEducator, getEducators, updateEducator,
  updateProfile, updatePassword,
} = require('../controllers/universityController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/educator', auth, createEducator);
router.get('/educators', auth, getEducators);
router.put('/educator/:id', auth, updateEducator);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);

module.exports = router;