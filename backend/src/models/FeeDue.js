import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeeDue = sequelize.define('FeeDue', {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  breakdown: {
    type: DataTypes.JSON, // e.g. { "Tuition Fee": 2500, "Transport Fee": 700 }
    defaultValue: {}
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PARTIAL', 'PAID'),
    defaultValue: 'PENDING'
  }
});

export default FeeDue;
