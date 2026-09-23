import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('PERCENTAGE', 'FLAT'),
    allowNull: false,
    defaultValue: 'FLAT'
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  frequency: {
    type: DataTypes.ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'),
    allowNull: false,
    defaultValue: 'MONTHLY'
  },
  category: {
    type: DataTypes.ENUM('ADMISSION', 'RECURRING', 'TRANSPORT', 'OPTIONAL'),
    allowNull: false,
    defaultValue: 'RECURRING'
  },
  isOptional: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  collectOnAdmission: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  }
});

export default Fee;
