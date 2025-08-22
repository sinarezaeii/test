const db = require('../models');
const Salon = db.Salon;
const Service = db.Service;
const BusinessHours = db.BusinessHours;

// @desc    Get public details of a salon by its slug
// @route   GET /api/salons/:slug
// @access  Public
exports.getSalonBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const salon = await Salon.findOne({
            where: { slug },
            attributes: ['id', 'name', 'address', 'phone'], // Only public info
            include: [
                {
                    model: Service,
                    as: 'services',
                    attributes: ['id', 'name', 'description', 'price', 'duration'],
                },
                {
                    model: BusinessHours,
                    as: 'businessHours',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'salonId'] }
                },
                {
                    model: db.User, // To get stylist info
                    as: 'staff',
                    where: { role: 'stylist' },
                    attributes: ['id', 'name'],
                    required: false // Use left join in case there are no stylists
                }
            ]
        });

        if (!salon) {
            return res.status(404).json({ message: 'Salon not found' });
        }

        res.json(salon);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching salon details', error: error.message });
    }
};
