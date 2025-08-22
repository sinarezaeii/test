const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, isSalonOwner } = require('../middleware/authMiddleware');

// Public routes for anyone to see the services of a salon
// This will be handled by a new public salon route later.
// For now, let's make the main GET public but the rest protected.
router.get('/', getServices);
router.get('/:id', getServiceById);

// Salon Owner routes
router.post('/', protect, isSalonOwner, createService);
router.put('/:id', protect, isSalonOwner, updateService);
router.delete('/:id', protect, isSalonOwner, deleteService);

module.exports = router;
