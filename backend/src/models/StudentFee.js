import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentFee = sequelize.define('StudentFee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discountType: {
    type: DataTypes.ENUM('FIXED', 'PERCENTAGE'),
    defaultValue: 'FIXED'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  isAdmissionPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAnnualPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  customTuitionFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  transportRouteId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transportOpted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  dueAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PARTIAL', 'PAID'),
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'StudentFees',
  timestamps: true
});

export default StudentFee;
