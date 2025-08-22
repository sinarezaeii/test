const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusinessHours = sequelize.define('BusinessHours', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 0: Sunday, 1: Monday, 2: Tuesday, ..., 6: Saturday
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 6,
    },
  },
  openTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  closeTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  salonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'Salons',
        key: 'id'
    }
  }
}, {
    indexes: [
        {
            unique: true,
            fields: ['dayOfWeek', 'salonId']
        }
    ]
});

module.exports = BusinessHours;
