import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffTimetable = sequelize.define('StaffTimetable', {
  staffId: { type: DataTypes.INTEGER },
  day: { type: DataTypes.STRING }, // MONDAY, TUESDAY...
  period: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING },
  subject: { type: DataTypes.STRING }
});

export default StaffTimetable;
