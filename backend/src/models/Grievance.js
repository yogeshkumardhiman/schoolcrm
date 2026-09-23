import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Grievance = sequelize.define('Grievance', {
  studentId: { type: DataTypes.INTEGER },
  studentName: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING },
  subject: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  teacherReply: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
  date: { type: DataTypes.STRING, defaultValue: new Date().toISOString() }
}, {
  tableName: 'Grievances',
  timestamps: true
});

export default Grievance;
