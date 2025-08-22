const db = require('../models');
const BusinessHours = db.BusinessHours;
const Holiday = db.Holiday;

// --- Business Hours ---

// @desc    Get business hours for the logged-in owner's salon
// @route   GET /api/schedule/hours
// @access  Private/SalonOwner
exports.getBusinessHours = async (req, res) => {
  try {
    const salonId = req.auth.salonId;
    const hours = await BusinessHours.findAll({
      where: { salonId },
      order: [['dayOfWeek', 'ASC']]
    });
    res.json(hours);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching business hours', error: error.message });
  }
};

// @desc    Set or update business hours for the logged-in owner's salon
// @route   POST /api/schedule/hours
// @access  Private/SalonOwner
exports.setBusinessHours = async (req, res) => {
  try {
    const hoursData = req.body; // Expects an array of business hours objects
    const salonId = req.auth.salonId;

    // Add salonId to each entry
    const dataWithSalonId = hoursData.map(h => ({ ...h, salonId }));

    const promises = dataWithSalonId.map(hour => {
      return BusinessHours.upsert(hour);
    });

    const results = await Promise.all(promises);
    res.status(200).json(results.map(r => r[0]));

  } catch (error) {
    res.status(400).json({ message: 'Error setting business hours', error: error.message });
  }
};


// --- Holidays ---

// @desc    Get all holidays for the logged-in owner's salon
// @route   GET /api/schedule/holidays
// @access  Private/SalonOwner
exports.getHolidays = async (req, res) => {
    try {
      const salonId = req.auth.salonId;
      const holidays = await Holiday.findAll({
          where: { salonId },
          order: [['date', 'ASC']]
        });
      res.json(holidays);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching holidays', error: error.message });
    }
  };

// @desc    Add a holiday for the logged-in owner's salon
// @route   POST /api/schedule/holidays
// @access  Private/SalonOwner
exports.addHoliday = async (req, res) => {
  try {
    const { date, description } = req.body;
    const salonId = req.auth.salonId;
    const holiday = await Holiday.create({ date, description, salonId });
    res.status(201).json(holiday);
  } catch (error) {
    res.status(400).json({ message: 'Error adding holiday', error: error.message });
  }
};

// @desc    Delete a holiday from the logged-in owner's salon
// @route   DELETE /api/schedule/holidays/:id
// @access  Private/SalonOwner
exports.deleteHoliday = async (req, res) => {
    try {
      const salonId = req.auth.salonId;
      const holiday = await Holiday.findByPk(req.params.id);

      if (!holiday) {
          return res.status(404).json({ message: 'Holiday not found' });
      }

      if (holiday.salonId !== salonId) {
          return res.status(403).json({ message: 'User not authorized to delete this holiday.' });
      }

      await holiday.destroy();
      res.json({ message: 'Holiday removed' });

    } catch (error) {
      res.status(500).json({ message: 'Error deleting holiday', error: error.message });
    }
  };
