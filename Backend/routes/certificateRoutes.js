const express = require('express');
const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/verify/:certificateId', certificateController.verifyCertificate);
router.get('/view/:certificateId', certificateController.viewCertificate);

// Protected routes
router.use(protect);

// Generate a certificate for a completed course
router.post('/generate/:courseId', certificateController.generateCertificate);

// Get all certificates for the current user
router.get('/my-certificates', certificateController.getMyCertificates);

// Get a specific certificate
router.get('/:id', certificateController.getCertificate);

// Download a certificate
router.get('/download/:id', certificateController.downloadCertificate);

module.exports = router;
