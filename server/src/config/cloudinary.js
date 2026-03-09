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
        // Determine folder and resource type
        let folder = 'virtual-gallery/others';
        let resource_type = 'auto';

        if (file.fieldname === 'profilePicture') {
            folder = 'virtual-gallery/profiles';
        } else if (file.fieldname === 'mediaFiles') {
            folder = 'virtual-gallery/exhibitions';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
    },
});

module.exports = { cloudinary, storage };
