const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'education_platform',
    allowed_formats: ['jpg', 'png', 'pdf'],
  },
});

const upload = multer({ storage });

module.exports = upload;