const mongoose = require("mongoose");
const Exhibition = require("../models/Exhibition");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const fs = require('fs');
const path = require('path');

// Creates a new exhibition listing with validation for dates and status

exports.createExhibitListing = async (req, res) => {
    try {
        const { title, description, category, startDate, endDate, status, price, isOnSale } = req.body;

        if (!title || !description || !category || !startDate || !endDate) {
            return res.status(400).json({ message: "All required fields (including dates) must be provided" });
        }

        if (status && !["draft", "published"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Handle Media Files
        let media = [];
        let coverImage = "";

        if (req.files && req.files.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');

            media = req.files.map(file => {
                const fileUrl = `${protocol}://${host}/uploads/exhibitions/${file.filename}`;
                let type = 'image';
                if (file.mimetype.startsWith('video/')) type = 'video';
                if (file.mimetype.startsWith('audio/')) type = 'audio';

                return {
                    url: fileUrl,
                    type: type,
                    originalName: file.originalname
                };
            });

            // Set Cover Image (First Image)
            const firstImage = media.find(m => m.type === 'image');
            if (firstImage) {
                coverImage = firstImage.url;
            }
        }

        // Currency Logic - Unified to INR
        let referencePrice = price; // Input is now strictly INR
        let referenceCurrency = "INR";
        let priceINR = 0;
        let finalTransactionCurrency = "INR";

        if (isOnSale && price) {
            priceINR = Number(price);
        }

        const exhibition = await Exhibition.create({
            title,
            description,
            category,
            startDate,
            endDate,
            status: status || "draft",
            coverImage, // Auto-set from upload
            media,      // Populated media array
            isOnSale,
            referencePrice,
            referenceCurrency,
            priceINR,
            transactionCurrency: finalTransactionCurrency,
            price: priceINR,
            currency: "INR",
            createdBy: req.user.id
        });

        res.status(201).json(exhibition);
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Create: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Retrieves all exhibitions created by the authenticated exhibitor

exports.fetchMyExhibits = async (req, res) => {
    try {
        const exhibitions = await Exhibition.find({
            createdBy: req.user.id
        }).populate('createdBy', 'name');

        res.json(exhibitions);
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Fetch My Exhibits: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Updates details of an existing exhibition, ensuring ownership authorization

// Updates details of an existing exhibition, ensuring ownership authorization

exports.updateExhibitDetails = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Exhibition not found" });
        }
        const exhibition = await Exhibition.findById(req.params.id);

        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        if (exhibition.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { title, description, category, startDate, endDate, status, price, isOnSale } = req.body;

        if (status && !["draft", "published"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Update Fields
        if (title) exhibition.title = title;
        if (description) exhibition.description = description;
        if (category) exhibition.category = category;
        if (startDate) exhibition.startDate = startDate;
        if (endDate) exhibition.endDate = endDate;
        if (status) exhibition.status = status;
        if (isOnSale !== undefined) exhibition.isOnSale = isOnSale; // Boolean check

        // Handle Price Updates
        if (price !== undefined) {
            // Unified: Assumes input price is always INR
            const newPrice = Number(price);

            exhibition.referencePrice = newPrice;
            exhibition.referenceCurrency = "INR";
            exhibition.priceINR = newPrice;
            exhibition.transactionCurrency = "INR";
            exhibition.price = newPrice;
            exhibition.currency = "INR";
        }

        // Handle New Media Uploads (if any)
        if (req.files && req.files.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');

            const newMedia = req.files.map(file => {
                const fileUrl = `${protocol}://${host}/uploads/exhibitions/${file.filename}`;
                let type = 'image';
                if (file.mimetype.startsWith('video/')) type = 'video';
                if (file.mimetype.startsWith('audio/')) type = 'audio';

                return {
                    url: fileUrl,
                    type: type,
                    originalName: file.originalname
                };
            });

            exhibition.media.push(...newMedia);

            // Auto-set cover image if not set, using the first available image
            if (!exhibition.coverImage && exhibition.media.length > 0) {
                const firstImage = exhibition.media.find(m => m.type === 'image');
                if (firstImage) {
                    exhibition.coverImage = firstImage.url;
                }
            }
        }

        await exhibition.save();

        if (status === 'published') {
            await Notification.create({
                userId: req.user.id,
                title: "Exhibit Published",
                message: `Your exhibit "${exhibition.title}" is now live.`,
                type: 'system',
                link: `/exhibitions/${exhibition._id}`
            });
        }

        res.json(exhibition);
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Update: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Handles media file uploads for an exhibition, classifying them as image, video, or audio

exports.uploadExhibitMedia = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Exhibition not found" });
        }
        const exhibition = await Exhibition.findById(req.params.id);

        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        if (exhibition.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files provided" });
        }

        const protocol = req.protocol;
        const host = req.get('host');

        const newMediaItems = req.files.map(file => {
            const fileUrl = `${protocol}://${host}/uploads/exhibitions/${file.filename}`;

            let type = 'image';
            if (file.mimetype.startsWith('video/')) type = 'video';
            if (file.mimetype.startsWith('audio/')) type = 'audio';

            return {
                url: fileUrl,
                type: type,
                originalName: file.originalname
            };
        });

        exhibition.media.push(...newMediaItems);

        // Auto-set cover image if not set, using the first available image
        if (!exhibition.coverImage) {
            const firstImage = exhibition.media.find(m => m.type === 'image');
            if (firstImage) {
                exhibition.coverImage = firstImage.url;
            }
        }

        // Fallback: If no image exists at all but we have video, maybe use a placeholder? 
        // For now, we leave it as is. If the user didn't upload an image, coverImage remains empty.

        await exhibition.save();

        res.json(exhibition);
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Upload Media: ${error.message}`);
        res.status(500).json({ message: "Upload failed" });
    }
};

// Deletes a specific media item from an exhibition and removes the physical file

exports.removeExhibitMedia = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Exhibition not found" });
        }
        const exhibition = await Exhibition.findById(req.params.id);

        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        if (exhibition.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const mediaItem = exhibition.media.id(req.params.mediaId);
        if (!mediaItem) {
            return res.status(404).json({ message: "Media item not found" });
        }

        // 1. Remove file from filesystem (Best effort)
        try {
            const relativePath = mediaItem.url.split('/uploads/')[1];
            if (relativePath) {
                const filePath = path.join(__dirname, '../../uploads/', relativePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (err) {
            console.error(`[WARN] Failed to delete file: ${err.message}`);
        }

        // 2. Remove from array
        exhibition.media.pull(req.params.mediaId);

        // 3. Update Cover Image if we deleted the current one
        if (exhibition.coverImage === mediaItem.url) {
            const nextImage = exhibition.media.find(m => m.type === 'image');
            exhibition.coverImage = nextImage ? nextImage.url : "";
        }

        await exhibition.save();

        res.json(exhibition);
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Remove Media: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Permanently removes an exhibition record from the database

exports.deleteExhibitListing = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Exhibition not found" });
        }
        const exhibition = await Exhibition.findById(req.params.id);

        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        if (exhibition.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await exhibition.deleteOne();
        res.json({ message: "Exhibition deleted successfully" });
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Delete: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Fetches all approved and published exhibitions that are currently active

exports.fetchPublicExhibits = async (req, res) => {
    try {
        const now = new Date();

        const exhibitions = await Exhibition.find({
            status: "published",
            verificationStatus: "approved",
            endDate: { $gte: now }
        })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(exhibitions);
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Fetch Public: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Retrieves exhibition details, applying privacy and approval logic based on user role

exports.viewExhibitDetails = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Exhibition not found" });
        }
        const exhibition = await Exhibition.findById(req.params.id).populate('createdBy', 'name');

        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        // 1. If Published AND Approved -> Public
        if (exhibition.status === 'published' && exhibition.verificationStatus === 'approved') {
            return res.json(exhibition);
        }

        // 2. Private Access Check
        if (!req.session || !req.session.user) {
            return res.status(403).json({ message: "This exhibition is private or pending verification." });
        }

        // Admin Override
        if (req.session.user.role === 'admin') {
            return res.json(exhibition);
        }

        // Owner Access
        if (exhibition.createdBy._id.toString() !== req.session.user.id) {
            return res.status(403).json({ message: "Not authorized to view this item" });
        }

        res.json(exhibition);

    } catch (error) {
        console.error(`[ERROR][ExhibitionController] View Details: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Fetches exhibition data for the paywalled view room

exports.accessPaywalledExhibit = async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id).populate('createdBy', 'name');
        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }
        // Access logic handled by middleware (authMiddleware.canAccessExhibit)
        res.json(exhibition);
    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Access Paywalled: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};
// Evaluates a user's access rights to an exhibition based on expiry, pricing, and purchase history

const resolveExhibitionAccess = async (exhibition, userId) => {
    const now = new Date();

    // 1. Expiry Check
    if (new Date(exhibition.endDate) < now) {
        return { hasAccess: false, isFree: false, isExpired: true, isPaid: false };
    }

    // 2. Free Check
    // "isOnSale === false OR priceINR === 0"
    if (!exhibition.isOnSale || exhibition.priceINR === 0) {
        return { hasAccess: true, isFree: true, isExpired: false, isPaid: false };
    }

    // 3. Paid Access Check
    if (!userId) {
        return { hasAccess: false, isFree: false, isExpired: false, isPaid: true };
    }

    const order = await Order.findOne({
        exhibitionId: exhibition._id,
        userId: userId,
        status: "paid"
    });

    return {
        hasAccess: !!order,
        isFree: false,
        isExpired: false,
        isPaid: true
    };
};

// Returns the access status (free, paid, expired) for a specific exhibition for the current user

exports.checkAccess = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        const exhibition = await Exhibition.findById(req.params.id);
        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        const userId = req.user ? req.user.id : null;
        const accessStatus = await resolveExhibitionAccess(exhibition, userId);

        return res.json(accessStatus);

    } catch (error) {
        console.error(`[ERROR][ExhibitionController] Check Access: ${error.message}`);
        res.status(500).json({ message: "Server error" });
    }
};

// Export internally for use in other controllers if needed
exports.resolveExhibitionAccess = resolveExhibitionAccess;
