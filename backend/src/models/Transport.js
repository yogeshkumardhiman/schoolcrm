import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transport = sequelize.define('Transport', {
  routeName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  monthlyFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  busNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default Transport;
