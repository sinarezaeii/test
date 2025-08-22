const db = require('../models');
const Service = db.Service;

// @desc    Create a service for the logged-in owner's salon
// @route   POST /api/services
// @access  Private/SalonOwner
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    const salonId = req.auth.salonId; // from protect middleware

    if (!salonId) {
      return res.status(403).json({ message: 'User is not associated with a salon.' });
    }

    const service = await Service.create({ name, description, price, duration, salonId });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error creating service', error: error.message });
  }
};

// @desc    Get all services for a specific salon
// @route   GET /api/services?salonId=...
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { salonId } = req.query;
    if (!salonId) {
        return res.status(400).json({ message: 'A salonId query parameter is required.' });
    }
    const services = await Service.findAll({ where: { salonId } });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// @desc    Get a single service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
    try {
      const service = await Service.findByPk(req.params.id);
      if (service) {
        res.json(service);
      } else {
        res.status(404).json({ message: 'Service not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching service', error: error.message });
    }
  };

// @desc    Update a service in the logged-in owner's salon
// @route   PUT /api/services/:id
// @access  Private/SalonOwner
exports.updateService = async (req, res) => {
  try {
    const salonId = req.auth.salonId;
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }

    if (service.salonId !== salonId) {
        return res.status(403).json({ message: 'User not authorized to update this service.' });
    }

    const { name, description, price, duration } = req.body;
    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;
    service.duration = duration || service.duration;
    const updatedService = await service.save();
    res.json(updatedService);

  } catch (error) {
    res.status(400).json({ message: 'Error updating service', error: error.message });
  }
};

// @desc    Delete a service from the logged-in owner's salon
// @route   DELETE /api/services/:id
// @access  Private/SalonOwner
exports.deleteService = async (req, res) => {
  try {
    const salonId = req.auth.salonId;
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }

    if (service.salonId !== salonId) {
        return res.status(403).json({ message: 'User not authorized to delete this service.' });
    }

    await service.destroy();
    res.json({ message: 'Service removed' });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
};
