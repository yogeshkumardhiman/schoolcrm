import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HomeworkSubmission = sequelize.define('HomeworkSubmission', {
  homeworkId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  studentName: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('PENDING', 'SUBMITTED', 'COMPLETED'), defaultValue: 'PENDING' },
  submittedAt: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT }, // Student's answer or notes
  attachmentUrl: { type: DataTypes.STRING },
  feedback: { type: DataTypes.TEXT },
  grade: { type: DataTypes.STRING }
}, {
  tableName: 'HomeworkSubmissions',
  timestamps: true
});

export default HomeworkSubmission;
