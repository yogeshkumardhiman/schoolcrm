import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Exam = sequelize.define('Exam', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 100
  },
  subjects: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'MARKING' // MARKING, COMPLETED
  },
  session: {
    type: DataTypes.STRING,
    defaultValue: '2026 - 2027'
  }
});

export default Exam;
