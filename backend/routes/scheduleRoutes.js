const express = require('express');
const router = express.Router();
const {
  getBusinessHours,
  setBusinessHours,
  getHolidays,
  addHoliday,
  deleteHoliday,
} = require('../controllers/scheduleController');
const { protect, isSalonOwner } = require('../middleware/authMiddleware');

// All routes in this file are protected and for Salon Owners only
router.use(protect, isSalonOwner);

// Business Hours routes
router.route('/hours')
  .get(getBusinessHours)
  .post(setBusinessHours);

// Holiday routes
router.route('/holidays')
  .get(getHolidays)
  .post(addHoliday);

router.delete('/holidays/:id', deleteHoliday);

module.exports = router;
