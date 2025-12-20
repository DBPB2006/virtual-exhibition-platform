const mongoose = require("mongoose");

const exhibitionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "Art", "Fashion", "Historic", "Antique",
                "Science", "Technology", "Culture", "Heritage",
                "Photography", "Media", "Architecture", "Design",
                "Art & Fashion", "Historic & Antique",
                "Science & Technology", "Photography & Media",
                "Architecture & Design", "Culture & Heritage"
            ],
            required: true
        },

        description: {
            type: String,
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        // Pricing Logic: Stores both reference prices (for display) and transactional prices (for payments)
        // Reference: What the exhibitor entered
        referencePrice: {
            type: Number,
            min: 0,
            required: function () {
                return this.isForSale === true;
            }
        },
        referenceCurrency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true
        },

        // Transaction: The actual value charged 
        priceINR: {
            type: Number,
            min: 0
        },
        transactionCurrency: {
            type: String,
            default: "INR",
            uppercase: true
        },

        isOnSale: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        },

        coverImage: {
            type: String,
            default: ""
        },

        media: [{
            url: { type: String, required: true },
            type: {
                type: String,
                enum: ['image', 'video', 'audio'],
                required: true
            },
            originalName: String
        }],

        // Verification System: Defines the approval status by admins
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        adminRemarks: {
            type: String,
            default: ""
        },
        verificationNotes: {
            type: String,
            default: ""
        },

        // The Exhibit Owner
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtuals for backward compatibility with frontend logic
exhibitionSchema.virtual('price').get(function () {
    return this.priceINR;
});

exhibitionSchema.virtual('currency').get(function () {
    return this.transactionCurrency;
});

exhibitionSchema.virtual('isForSale').get(function () {
    return this.isOnSale;
});

module.exports = mongoose.model("Exhibition", exhibitionSchema);
