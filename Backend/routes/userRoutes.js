const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploads'); // For file uploads
const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// User profile routes
router
  .route("/me")
  .get(userController.getLoggedInUser)
  .put(upload.single("profileImage"), userController.updateLoggedInUser);

module.exports = router;
// {
//     "name": "Anand",
//     "email": "admin@drinkun.com",
//     "phoneNumber": "+914569631475",
//     "profile": {
//         "address": "101 Medical Plaza, Town",
//         "zipcode": "321456",
//         "state": "Jharkhand",
//         "category": "School",
//         "schoolName": "KSV",
//         "avatar": "/uploads/profiles/1746429210255-profileImage.jpg"
//     }
// }
