import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SalaryStructure = sequelize.define('SalaryStructure', {
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  baseSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  allowances: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  netSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'SalaryStructures',
  timestamps: true
});

export default SalaryStructure;
