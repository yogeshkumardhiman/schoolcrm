import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OnlineTransaction = sequelize.define('OnlineTransaction', {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpaySignature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('CREATED', 'SUCCESS', 'FAILED'),
    defaultValue: 'CREATED'
  },
  feeDueIds: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
});

export default OnlineTransaction;
