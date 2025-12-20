const Order = require('../models/Order');

// Retrieves aggregate sales data associated with the currently authenticated exhibitor

exports.fetchExhibitorSalesData = async (req, res) => {
    try {
        const exhibitorId = req.user.id;

        const salesData = await Order.find({ exhibitorId })
            .populate('userId', 'name email')
            .populate('exhibitionId', 'title')
            .sort({ createdAt: -1 });

        res.json(salesData);

    } catch (error) {
        console.error(`[ERROR][ExhibitorController] Fetch Sales: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching sales' });
    }
};
