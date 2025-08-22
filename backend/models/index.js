const sequelize = require('../config/database');
const User = require('./User');
const Service = require('./Service');
const Appointment = require('./Appointment');
const BusinessHours = require('./BusinessHours');
const Holiday = require('./Holiday');
const Salon = require('./Salon');

// --- Define Associations ---

// Salon <=> User (Owner)
// A user with role 'salon_owner' owns one Salon
User.hasOne(Salon, { foreignKey: 'ownerId', as: 'ownedSalon' });
Salon.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Salon <=> User (Staff: Owners, Stylists)
// A salon can have multiple staff members (owners, stylists)
Salon.hasMany(User, { foreignKey: 'salonId', as: 'staff' });
User.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

// Salon <=> Service
Salon.hasMany(Service, { foreignKey: 'salonId', as: 'services' });
Service.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

// Salon <=> BusinessHours
Salon.hasMany(BusinessHours, { foreignKey: 'salonId', as: 'businessHours' });
BusinessHours.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

// Salon <=> Holiday
Salon.hasMany(Holiday, { foreignKey: 'salonId', as: 'holidays' });
Holiday.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

// Salon <=> Appointment
Salon.hasMany(Appointment, { foreignKey: 'salonId', as: 'appointments' });
Appointment.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

// --- Appointment Associations ---

// Appointment <=> User (Customer)
User.hasMany(Appointment, { foreignKey: 'userId', as: 'bookedAppointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// Appointment <=> User (Stylist)
User.hasMany(Appointment, { foreignKey: 'stylistId', as: 'assignedAppointments' });
Appointment.belongsTo(User, { foreignKey: 'stylistId', as: 'stylist' });

// Appointment <=> Service
Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });


// --- Collect all models and export ---
const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  User,
  Service,
  Appointment,
  BusinessHours,
  Holiday,
  Salon,
};

// Function to initialize and sync database
db.syncDb = async () => {
  try {
    // During development, you might want to use { force: true } to drop and recreate tables.
    // In production, you should use migrations.
    const forceSync = process.env.NODE_ENV === 'development';
    await sequelize.sync({ force: forceSync });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
};

module.exports = db;
