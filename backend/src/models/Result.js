import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Result = sequelize.define('Result', {
  studentId: { type: DataTypes.INTEGER },
  subject: { type: DataTypes.STRING },
  marks: { type: DataTypes.INTEGER },
  total: { type: DataTypes.INTEGER },
  examType: { type: DataTypes.STRING },
  session: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'Results',
  timestamps: true
});

export default Result;
