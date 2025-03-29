const express = require('express');
const {
  getUniversities, createUniversity, updateUniversity,
  getContent, createContent, approveContent, rejectContent, deleteContent,
  getCourses, updateProfile, updatePassword, updateContent, // Added
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/universities', auth, getUniversities);
router.post('/university', auth, createUniversity);
router.put('/university/:id', auth, updateUniversity);
router.get('/content', auth, getContent);
router.post('/content', auth, upload.single('file'), createContent);
router.put('/content/approve/:id', auth, approveContent);
router.put('/content/reject/:id', auth, rejectContent);
router.delete('/content/:id', auth, deleteContent);
router.put('/content/:id', auth, updateContent); // Added
router.get('/courses', auth, getCourses);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);

module.exports = router;


