const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'virtual-gallery/others';
        let resource_type = 'auto';

        if (file.fieldname === 'profilePicture') {
            folder = 'virtual-gallery/profiles';
            resource_type = 'image';
        } else if (file.fieldname === 'mediaFiles') {
            folder = 'virtual-gallery/exhibitions';
        }

        // Strip the extension from originalname to prevent double-extension issues
        // e.g. "avatar.JPG" → "avatar", not "avatar.JPG.jpg"
        const baseName = file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
        const uniqueName = `${Date.now()}-${baseName}`;

        return {
            folder,
            resource_type,
            public_id: uniqueName,
            // Explicitly allow these formats so multer-storage-cloudinary v4+ doesn't reject them
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav', 'pdf'],
        };
    },
});

module.exports = { cloudinary, storage };
