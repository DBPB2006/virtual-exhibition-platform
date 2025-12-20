// Middleware to validate that the start and end dates of an exhibition are logically correct
const validateExhibitDates = (req, res, next) => {
    try {
        const { startDate, endDate } = req.body;

        // Skip if not updating dates (for update routes)
        if (req.method === 'PUT' && !startDate && !endDate) {
            return next();
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            if (isNaN(start.getTime())) {
                return res.status(400).json({ message: "Invalid Start Date format" });
            }

            if (start < today) {
                return res.status(400).json({ message: "Start date cannot be in the past" });
            }
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(0, 0, 0, 0);

            if (isNaN(end.getTime())) {
                return res.status(400).json({ message: "Invalid End Date format" });
            }

            // If we have both, check range
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (end < start) {
                    return res.status(400).json({ message: "End date cannot be before start date" });
                }
            }
        }

        next();
    } catch (error) {
        console.error(`[MIDDLEWARE_ERROR] Date Validation: ${error.message}`);
        res.status(500).json({ message: "Server error during date validation" });
    }
};

module.exports = validateExhibitDates;
