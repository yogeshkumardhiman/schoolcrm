import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TransportStop = sequelize.define('TransportStop', {
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stopName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'TransportStops',
  timestamps: true
});

export default TransportStop;
