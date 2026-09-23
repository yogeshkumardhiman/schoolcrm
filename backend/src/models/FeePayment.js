import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeePayment = sequelize.define('FeePayment', {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  mode: {
    type: DataTypes.ENUM('CASH', 'ONLINE', 'CHEQUE'),
    defaultValue: 'CASH'
  },
  month: {
    type: DataTypes.STRING, // e.g. "April 2026"
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  onlineTransactionId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default FeePayment;
