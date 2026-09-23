import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Homework = sequelize.define('Homework', {
  title: { type: DataTypes.STRING },
  subject: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  dueDate: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  teacherId: { type: DataTypes.INTEGER },
  teacherName: { type: DataTypes.STRING },
  priority: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'MEDIUM' },
  isUrgent: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('ACTIVE', 'ARCHIVED', 'DRAFT'), defaultValue: 'ACTIVE' },
  attachments: { type: DataTypes.JSON }, // Array of URLs
  session: { type: DataTypes.STRING }
}, {
  tableName: 'Homework',
  timestamps: true
});

export default Homework;
