const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Filters files to allow only supported image, video, and audio formats
// Cross-OS image support: HEIC/HEIF (iPhone/macOS), BMP/TIFF (Windows), SVG, WebP
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|tif|heic|heif|svg|mp4|webm|mp3|pdf|wav|mpeg/;
    const ext = require('path').extname(file.originalname).toLowerCase().replace('.', '');
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
