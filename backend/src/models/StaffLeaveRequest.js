import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffLeaveRequest = sequelize.define('StaffLeaveRequest', {
  staffId: { type: DataTypes.INTEGER },
  startDate: { type: DataTypes.STRING },
  endDate: { type: DataTypes.STRING },
  reason: { type: DataTypes.TEXT },
  type: { type: DataTypes.STRING, defaultValue: 'FULL_DAY' },
  status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
  appliedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'StaffLeaveRequests'
});

export default StaffLeaveRequest;
