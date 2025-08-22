const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { protect, isSuperAdmin } = require('../middleware/authMiddleware');

// All routes in this file are protected and for Super Admins only
router.use(protect, isSuperAdmin);

router.route('/').get(getUsers);
router.route('/:id').get(getUserById);

module.exports = router;
