const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadsDir = 'uploads';
const profilesDir = 'uploads/profiles';

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
}

// Configure storage (save to local uploads/ folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check if it's a profile image
        if (file.fieldname === 'profileImage') {
            cb(null, profilesDir); // Store profile images in profiles subdirectory
        } else {
            cb(null, uploadsDir); // Store other files in main uploads directory
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '-' + file.fieldname + ext);
    },
});

const upload = multer({ storage });

module.exports = upload;
