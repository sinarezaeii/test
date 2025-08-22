const { Op } = require('sequelize');
const db = require('../models');
const moment = require('moment');

// @desc    Get available time slots for a date, service, and salon
// @route   GET /api/appointments/available-slots?date=...&serviceId=...&salonId=...
// @access  Public
exports.getAvailableSlots = async (req, res) => {
    const { date, serviceId, salonId } = req.query;

    if (!date || !serviceId || !salonId) {
        return res.status(400).json({ message: 'Date, Service ID, and Salon ID are required' });
    }

    try {
        const service = await db.Service.findByPk(serviceId);
        if (!service || service.salonId !== parseInt(salonId)) {
            return res.status(404).json({ message: 'Service not found for this salon' });
        }

        const dayOfWeek = moment(date).day();
        const businessHour = await db.BusinessHours.findOne({ where: { dayOfWeek, salonId } });
        const holiday = await db.Holiday.findOne({ where: { date, salonId } });

        if (holiday || !businessHour || businessHour.isClosed) {
            return res.json([]); // Salon is closed
        }

        const appointmentsOnDate = await db.Appointment.findAll({
            where: { date, salonId, status: { [Op.ne]: 'cancelled' } },
            order: [['startTime', 'ASC']],
        });

        const availableSlots = [];
        const serviceDuration = service.duration;
        let currentTime = moment.utc(businessHour.openTime, 'HH:mm:ss');
        const closeTime = moment.utc(businessHour.closeTime, 'HH:mm:ss');

        while (currentTime.clone().add(serviceDuration, 'minutes').isSameOrBefore(closeTime)) {
            const slotStart = currentTime.clone();
            const slotEnd = slotStart.clone().add(serviceDuration, 'minutes');

            let isSlotAvailable = true;
            for (const app of appointmentsOnDate) {
                const appStart = moment.utc(app.startTime, 'HH:mm:ss');
                const appEnd = moment.utc(app.endTime, 'HH:mm:ss');
                if (slotStart.isBefore(appEnd) && slotEnd.isAfter(appStart)) {
                    isSlotAvailable = false;
                    break;
                }
            }

            if (isSlotAvailable) {
                availableSlots.push(slotStart.format('HH:mm'));
            }
            currentTime.add(15, 'minutes'); // Check in 15-minute increments
        }
        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/Customer
exports.createAppointment = async (req, res) => {
    const { salonId, serviceId, stylistId, date, startTime } = req.body;
    const userId = req.user.id;

    try {
        const service = await db.Service.findByPk(serviceId);
        if (!service || service.salonId !== salonId) {
            return res.status(404).json({ message: 'Service not found for this salon' });
        }

        const endTime = moment(startTime, 'HH:mm').add(service.duration, 'minutes').format('HH:mm:ss');

        const appointment = await db.Appointment.create({
            userId,
            salonId,
            serviceId,
            stylistId,
            date,
            startTime,
            endTime,
            status: 'confirmed', // Directly confirm appointments
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
};

// @desc    Get appointments for the logged-in user
// @route   GET /api/appointments/my-appointments
// @access  Private/Customer
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await db.Appointment.findAll({
            where: { userId: req.user.id },
            include: [
                { model: db.Service, as: 'service' },
                { model: db.Salon, as: 'salon', attributes: ['id', 'name'] },
                { model: db.User, as: 'stylist', attributes: ['id', 'name'] }
            ],
            order: [['date', 'DESC'], ['startTime', 'DESC']],
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

// @desc    Get all appointments for the logged-in owner's salon
// @route   GET /api/appointments
// @access  Private/SalonOwner
exports.getAllAppointments = async (req, res) => {
    try {
        const salonId = req.auth.salonId;
        const appointments = await db.Appointment.findAll({
            where: { salonId },
            include: [
                { model: db.Service, as: 'service' },
                { model: db.User, as: 'customer', attributes: ['id', 'name', 'email'] },
                { model: db.User, as: 'stylist', attributes: ['id', 'name'] }
            ],
            order: [['date', 'DESC'], ['startTime', 'DESC']],
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all appointments', error: error.message });
    }
};

// @desc    Update appointment status for an owner's salon
// @route   PUT /api/appointments/:id/status
// @access  Private/SalonOwner
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await db.Appointment.findByPk(req.params.id);

        if (!appointment || appointment.salonId !== req.auth.salonId) {
            return res.status(404).json({ message: 'Appointment not found in your salon' });
        }
        appointment.status = status;
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
};

// @desc    Cancel an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await db.Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Allow cancellation if user is the customer OR the owner of the salon
        const isOwnerOfAppointment = appointment.userId === req.user.id;
        const isOwnerOfSalon = req.auth.role === 'salon_owner' && appointment.salonId === req.auth.salonId;

        if (isOwnerOfAppointment || isOwnerOfSalon) {
            appointment.status = 'cancelled';
            await appointment.save();
            res.json({ message: 'Appointment cancelled' });
        } else {
            res.status(403).json({ message: 'User not authorized to cancel this appointment' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
};
