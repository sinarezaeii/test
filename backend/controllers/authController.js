const db = require('../models');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models');
const User = db.User;
const Salon = db.Salon;

// @desc    Register a new user or salon owner
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  // Body for a customer: { name, email, phone, password }
  // Body for a salon_owner: { name, email, phone, password, role: 'salon_owner', salonName, salonAddress, salonPhone }
  const { name, email, phone, password, role, salonName, salonAddress, salonPhone } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    let user;
    let salon;

    if (role === 'salon_owner') {
      // Use a transaction to ensure both user and salon are created successfully
      const result = await sequelize.transaction(async (t) => {
        // Create the user (owner)
        const newOwner = await User.create({
          name,
          email,
          phone,
          password,
          role: 'salon_owner',
        }, { transaction: t });

        // Create the salon
        const newSalon = await Salon.create({
          name: salonName,
          address: salonAddress,
          phone: salonPhone,
          slug: salonName.toLowerCase().replace(/\s+/g, '-'), // simple slug generation
          ownerId: newOwner.id,
        }, { transaction: t });

        // Update the user with the salonId
        newOwner.salonId = newSalon.id;
        await newOwner.save({ transaction: t });

        return { newOwner, newSalon };
      });
      user = result.newOwner;
      salon = result.newSalon;

    } else {
      // Create a standard customer user
      user = await User.create({
        name,
        email,
        phone,
        password,
        role: 'customer',
      });
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      salonId: user.salonId,
      token: generateToken(user.id, user.role, user.salonId),
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      salonId: user.salonId,
      token: generateToken(user.id, user.role, user.salonId),
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate JWT
const generateToken = (id, role, salonId) => {
  const payload = { id, role };
  if (salonId) {
    payload.salonId = salonId;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
