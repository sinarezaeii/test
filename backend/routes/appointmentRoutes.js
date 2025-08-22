const express = require('express');
const router = express.Router();
const {
    getAvailableSlots,
    createAppointment,
    getMyAppointments,
    getAllAppointments,
    updateAppointmentStatus,
    cancelAppointment
} = require('../controllers/appointmentController');
const { protect, isSalonOwner } = require('../middleware/authMiddleware');

// Public route to check for available slots
router.get('/available-slots', getAvailableSlots);

// Routes for logged-in users (customers)
router.post('/', protect, createAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.delete('/:id', protect, cancelAppointment); // User can cancel their own

// Salon owner routes
router.get('/', protect, isSalonOwner, getAllAppointments);
router.put('/:id/status', protect, isSalonOwner, updateAppointmentStatus);

module.exports = router;
