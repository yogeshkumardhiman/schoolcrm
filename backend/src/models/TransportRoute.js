import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TransportRoute = sequelize.define('TransportRoute', {
  routeName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monthlyFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
}, {
  tableName: 'TransportRoutes',
  timestamps: true
});

export default TransportRoute;
