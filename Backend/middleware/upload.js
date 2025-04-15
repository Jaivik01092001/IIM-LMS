// const multer = require('multer');
// const cloudinary = require('../config/cloudinary');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'education_platform',
//     allowed_formats: ['jpg', 'png', 'pdf'],
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;


// middleware/upload.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(ext);
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext);

    if (!isVideo && !isImage) {
      throw new Error('Unsupported file format');
    }

    return {
      folder: 'education_platform',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      format: ext,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = upload;
