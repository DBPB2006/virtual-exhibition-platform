const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Filters files to allow only supported image, video, and audio formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mp3|pdf|wav|mpeg/;
    const ext = require('path').extname(file.originalname).toLowerCase();
    const isAllowed = allowedTypes.test(ext) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/');

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error('Error: File type not supported!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
