import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeeStructure = sequelize.define('FeeStructure', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tuitionFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  transportFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  annualFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  examFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  admissionFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  annualMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  examMonths: {
    type: DataTypes.STRING,
    defaultValue: '9,2'
  }
}, {
  tableName: 'FeeStructures',
  timestamps: true
});

export default FeeStructure;
