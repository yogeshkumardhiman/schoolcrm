import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentFeeAssignment = sequelize.define('StudentFeeAssignment', {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  feeHeadId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  frequency: {
    type: DataTypes.STRING, // ONE_TIME, MONTHLY, QUARTERLY, YEARLY
    allowNull: false
  }
}, {
  tableName: 'StudentFeeAssignments',
  timestamps: true
});

export default StudentFeeAssignment;
