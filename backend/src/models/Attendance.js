import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Attendance = sequelize.define('Attendance', {
  studentId: { type: DataTypes.INTEGER },
  class: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING }, // Updated from STRING to DATEONLY
  status: { type: DataTypes.STRING, defaultValue: 'PRESENT' },
  session: { type: DataTypes.STRING }
}, {
  tableName: 'Attendances'
});

export default Attendance;
