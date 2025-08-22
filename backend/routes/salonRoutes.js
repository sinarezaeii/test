const express = require('express');
const router = express.Router();
const { getSalonBySlug } = require('../controllers/salonController');

// @route   GET /api/salons/:slug
// @desc    Get public salon data
// @access  Public
router.get('/:slug', getSalonBySlug);

module.exports = router;
