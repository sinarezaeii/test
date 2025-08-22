const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

// Middleware to verify the token and attach user to the request
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object to the request
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Also attach the decoded token payload which contains role and salonId
      req.auth = decoded;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check for 'super_admin' role
const isSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Super Admin' });
  }
};

// Middleware to check for 'salon_owner' role
const isSalonOwner = (req, res, next) => {
    if (req.auth && req.auth.role === 'salon_owner') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as a Salon Owner' });
    }
  };

// Middleware to check for 'stylist' role
const isStylist = (req, res, next) => {
    if (req.auth && req.auth.role === 'stylist') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as a Stylist' });
    }
  };


module.exports = { protect, isSuperAdmin, isSalonOwner, isStylist };
