const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadsDir = 'uploads';
const profilesDir = 'uploads/profiles';
const blogsDir = 'uploads/blogs';

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
}

if (!fs.existsSync(blogsDir)) {
    fs.mkdirSync(blogsDir);
}

// Configure storage (save to local uploads/ folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check file field name to determine destination
        if (file.fieldname === 'profileImage') {
            cb(null, profilesDir); // Store profile images in profiles subdirectory
        } else if (file.fieldname === 'coverImage') {
            cb(null, blogsDir); // Store blog cover images in blogs subdirectory
        } else {
            cb(null, uploadsDir); // Store other files in main uploads directory
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        // Create a unique filename with original extension
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    },
});

// Add file filter for debugging
const fileFilter = (req, file, cb) => {
    console.log('Processing file upload:', file.fieldname, file.originalname);
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Add middleware to log request details before multer processes it
const loggedUpload = {
    single: (fieldName) => {
        return (req, res, next) => {
            console.log(`Upload middleware called for field: ${fieldName}`);
            console.log('Request method:', req.method);
            console.log('Request headers:', req.headers);

            // Call the actual multer middleware
            upload.single(fieldName)(req, res, (err) => {
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).json({ message: 'File upload error', error: err.message });
                }
                console.log('File upload processed successfully:', req.file || 'No file uploaded');
                next();
            });
        };
    },
    any: () => {
        return (req, res, next) => {
            console.log('Upload middleware called for any fields');

            // Call the actual multer middleware
            upload.any()(req, res, (err) => {
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).json({ message: 'File upload error', error: err.message });
                }
                console.log('Files upload processed successfully:', req.files ? req.files.length : 'No files uploaded');
                next();
            });
        };
    }
};

module.exports = loggedUpload;
