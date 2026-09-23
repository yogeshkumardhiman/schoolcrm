import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeeHead = sequelize.define('FeeHead', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true 
  },
  frequency: { 
    type: DataTypes.ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'), 
    allowNull: false 
  },
  category: {
    type: DataTypes.ENUM('ADMISSION', 'RECURRING', 'TRANSPORT', 'OPTIONAL'),
    allowNull: false,
    defaultValue: 'RECURRING'
  },
  collectOnAdmission: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isOptional: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  applicableMonths: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'JSON array of month names e.g. ["April","September","February"]. If null, uses frequency-based logic.'
  }
});

export default FeeHead;
