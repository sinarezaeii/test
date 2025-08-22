require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the salon booking API.' });
});

// API routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/serviceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);

const scheduleRoutes = require('./routes/scheduleRoutes');
app.use('/api/schedule', scheduleRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const salonRoutes = require('./routes/salonRoutes');
app.use('/api/salons', salonRoutes);

const PORT = process.env.PORT || 8080;

// Sync database and start server
db.syncDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});
