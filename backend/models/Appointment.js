const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  salonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'Salons',
        key: 'id'
    }
  },
  // The specific stylist for the appointment
  stylistId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null if salon assigns stylists later or has only one
    references: {
        model: 'Users',
        key: 'id'
    }
  }
  // Foreign keys for UserId (customer) and ServiceId will be added via associations
});

module.exports = Appointment;
