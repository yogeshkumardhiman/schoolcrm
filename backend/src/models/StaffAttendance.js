import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffAttendance = sequelize.define('StaffAttendance', {
  staffId: { type: DataTypes.INTEGER },
  date: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }, // PRESENT, ABSENT, LEAVE
  markedBy: { type: DataTypes.STRING },
  remark: { type: DataTypes.STRING },
  checkInTime: { type: DataTypes.STRING },
  checkOutTime: { type: DataTypes.STRING },
  workingHours: { type: DataTypes.STRING }
});

export default StaffAttendance;
