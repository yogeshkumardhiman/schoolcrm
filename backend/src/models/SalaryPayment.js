import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SalaryPayment = sequelize.define('SalaryPayment', {
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PAID', 'PENDING'),
    defaultValue: 'PENDING'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'SalaryPayments',
  timestamps: true
});

export default SalaryPayment;
