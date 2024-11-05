const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'avatars',
            public_id: req.user._id,
            overwrite: true,
            resource_type: 'image',
        };
    },
});

// File filter function to allow only jpeg/jpg and gif formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and GIF are allowed.'), false); // Reject the file
    }
};

// Multer configuration with storage and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
