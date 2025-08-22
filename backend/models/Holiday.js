const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
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
            fields: ['date', 'salonId']
        }
    ]
});

module.exports = Holiday;
